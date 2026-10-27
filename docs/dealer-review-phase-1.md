# Auto Prestige: 27 October 2026 review

This branch changes only Auto Prestige. Existing DMS sold/reserved publication rules, Excel-selected legacy archive, and photo storage are preserved. No production credentials or API key settings were changed. Rotation remains with the owner, as requested.

## Code changes

- Replace exposed stock credentials and forgeable cookies with Payload admin login and signed eight-hour sessions. The stock login now uses the existing CMS admin email/password. Existing shared stock passwords and cookies no longer work. Reg-plate administration uses the same session verification.
- Require admin sessions for vehicle override writes; retain the public read contract used by the showroom.
- Patch Next to 15.5.28, all Payload packages to 3.92.0, React to 19.3.1, Sharp to 0.35.5, Swiper to 12.1.2, and vulnerable tooling/transitive dependencies. Node must be 22.23.4+ on 22.x or 24.22.1+. Docker uses 22.23.4.
- Authenticate stock requests with `DMS_WEBSITE_KEY`. Stock URLs no longer include dealer email. The DMS reserved-ad archive currently still requires the configured dealer email, so that separate request retains it and also sends the key. No DMS changes are included.
- Require `DEALER_ID`, the lead secret and webhook URL before delivery. Overwrite both routing IDs on the server. Enquiries/reservations fail when DMS delivery fails, even when email succeeds.
- Add honeypots, origin checks and a Mongo-backed atomic limit shared across replicas (10 submissions/IP/10 minutes). IP addresses are stored as bucket-specific SHA-256 hashes, with TTL cleanup.
- Escape customer text before rendering email templates; report Resend errors and send only to the configured recipient.
- Require payment signatures and constant-time HMAC verification before parsing events or touching payment records. Restrict Payments and Listings REST/GraphQL access to CMS admins; local server-side operations retain their existing access behavior. The frontend seed endpoint was already disabled and remains disabled.
- Report fixed operational error codes to GlitchTip when configured, without customer data, URLs, keys or upstream response bodies.
- Publish page-specific canonical URLs and robots.txt, remove fabricated ratings, and use the same live stock for vehicle/make sitemaps and navigation. Missing pages/vehicles return real 404s. Remove the global loading boundary that previously flushed HTTP 200 before missing-page detection.
- Use real dealership contacts on complaints and safe dealer-specific defaults. Correct finance return URLs. Preserve saved wishlists while migrating the storage key, remove debug logs/build artifacts, and compress large showroom JPEGs.
- Support `SOLD_IMAGES_PUBLIC_BASE_URL` to map legacy R2 image paths to a verified custom domain without editing archived records.

## Stock caching

- The live, reserved and sold lists are read and reconciled together and cached as one bundle, so a car can never appear in two lists of different ages. The DMS stock is cached in the site's memory: fresh for 5 minutes (`STOCK_CACHE_SECONDS`, default 300). After that the last stock is returned immediately while a single refresh runs behind the request, and stock is never served older than 15 minutes, even if the DMS is down (then the site errors and alerts, as before). Pages, API routes and sitemaps share this one cache, so a visit no longer triggers a full DMS read; at most one read per instance every 5 minutes. A failed refresh is never cached as an empty showroom.
- Stock API responses (`/api/listings`, `/api/listing/:id`, `/api/featured-vehicles`, `/api/available-makes-models`, `/api/sold-listings`) are sent with `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=60`, so repeat browser fetches and any CDN reuse them. Errors and missing vehicles are `no-store`.
- Worst-case staleness is therefore a few minutes on top of the DMS's own short cache; a reservation or sale shows on the site within about 5-6 minutes. A restart of the app clears the cache.

`STOCK_MAX_STALE_SECONDS` (default 900) bounds the stale window. The stock-admin list always bypasses the browser cache, and price/advert overrides are applied from the database on every request, so admin edits are not delayed by the stock cache.

## Deployment requirements and external findings

These are deployment requirements, not claims that production has already changed. Review and merge this PR before deploying it.

1. Keep the existing production credentials; the owner manages rotation. Ensure `DEALER_ID`, `DMS_WEBSITE_KEY`, `EXTERNAL_NOTIFICATIONS_WEBHOOK_SECRET`, `FORM_SUBMIT_WEBHOOK_URL`, `EMAIL_TO` and the existing strong `PAYLOAD_SECRET` are configured before deployment. An optional reservation-specific URL is supported. Missing authentication deliberately fails closed.
2. Use a supported Node runtime. The app's Mongo user needs write access to the rate-limit collection; TTL indexes should be allowed. Mongo is already required by this site.
3. Configure `GLITCHTIP_DSN` to enable remote alerts. Without it, failures remain visible in server logs and fail the affected request.
4. Coolify application `k8sg08w0ggwg40owgwoksw40` has both HTTPS domains but generates `traefik.http.middlewares.1-k8sg08w0ggwg40owgwoksw40-to-non-www.redirectregex.permanent=false`. That proxy sends the live 302 before application middleware runs. Change this to a permanent redirect as part of deployment, or let the application handle the www redirect. The application returns 301 and preserves the path/query. No production proxy/deployment changes were made in this PR.
5. Attach and verify a custom domain on the existing archive bucket, then set `SOLD_IMAGES_PUBLIC_BASE_URL`. Until that domain is verified/configured, existing photo URLs are deliberately preserved to avoid breaking the archive. No Cloudflare credentials or bucket configuration were modified.

6. **Transition:** until `DMS_WEBSITE_KEY` is set, stock falls back to the dealer-email access the DMS still accepts (`DEALER_EMAIL`), with a log warning, so a deploy without the key does not empty the showroom. Remove the fallback before the DMS enables `WEBSITE_FEED_REQUIRE_KEY`.

## Validation

- 113 integration tests pass against an isolated local MongoDB. Includes real CMS admin/non-admin login, private collection access, concurrent rate-limit enforcement, signed-session expiry/tampering, payment signatures, and existing live/reserved/sold/archive/enquiry regressions.
- Optimized Next production build passes, including TypeScript and ESLint. Existing non-blocking lint warnings remain.
- Five HTTP smoke tests pass against the built app with an isolated stock fixture: real 404s; page canonicals/contact details; robots; forged admin cookies rejected; unsigned payments and honeypots rejected. Run with `REVIEW_BASE_URL=http://localhost:4310 node --test tests/smoke/production-smoke.test.mjs`. The suite refuses non-local targets.
- Browser checks: homepage/showroom render, stock links exist, CMS admin login reaches stock admin, desktop/mobile layout checked.
- `npm audit` and `npm audit --omit=dev`: zero high/critical; two moderate advisories remain in the upstream query-string/decode-uri-component chain. No patched decode-uri-component release is currently available in the registry.

No live customer lead, reservation, payment or stock writes were used for testing.
