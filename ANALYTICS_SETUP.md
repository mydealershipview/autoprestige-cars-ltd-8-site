# MYDV dealer analytics setup

This repository includes a consent-aware GTM/GA4 bootstrap and a dealer event data layer. Set `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX` for the dealer's published GTM container. When GTM is configured, put the GA4 Google tag in that container using this dealer's measurement ID. Do not also add a standalone GA4 tag or duplicate conversion tags. With no GTM ID, the existing GA4 measurement ID (`NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, `GOOGLE_ANALYTICS_ID`, or this site's `G-J5CW3RRHHV`) is used directly.

Consent Mode v2 defaults analytics and all advertising consent to denied before loading either tag. The banner can grant analytics only or all categories; the footer reopens it. Legacy `cookies-accepted` choices are read on the first visit after deployment. Test accept, analytics only, necessary only, and a revisit in Tag Assistant before publishing a container. Configure any extra tags in GTM with appropriate consent checks.

## GTM container

- Create one GA4 Google tag for all public pages with the dealer measurement ID. Turn on enhanced measurement as needed, checking that its form and click events do not duplicate the custom events below.
- Create a Custom Event trigger for each event below and a matching GA4 Event tag. Pass through the listed safe parameters using Data Layer Variables. `generate_lead` is emitted alongside `enquiry_submitted` to support GA4's recommended lead event; mark/import only one of the two as a key conversion so a single lead is not counted twice.
- Use GTM Preview and GA4 DebugView to verify each event, including failed form requests (which must produce no submission event). For phone and WhatsApp clicks, test each placement, including buttons that open a new window.

| Event | When it fires | Parameters |
| --- | --- | --- |
| `mydv_page_view` | Client route change | `page_path` |
| `view_item`, `vehicle_detail_view` | Vehicle detail renders | GA4 `items` array, `currency`, `value` on `view_item`; `item_id` on the second event |
| `finance_quote_started` | Finance action click or first form interaction | `item_id` when available |
| `finance_quote_submitted` | Finance form API succeeds | `item_id` when available |
| `enquiry_submitted`, `generate_lead` | Contact, valuation, service, finance, or vehicle enquiry API succeeds | `form_type`, `item_id` when available |
| `click_to_call` | A telephone link is clicked | `link_location` |
| `whatsapp_click` | A WhatsApp link or vehicle WhatsApp button is clicked | `link_location`, `item_id` when available |
| `reservation_started` | Reserve action is clicked | `item_id` |
| `reservation_submitted` | Reservation form API succeeds | `item_id` |
| `reservation_completed` | Payment status API confirms `COMPLETED` | `currency`, `value` |
| `test_drive_requested` | A dedicated `book-appointment` vehicle form succeeds | `item_id` when available |

The current site has no dedicated test drive booking form. The service booking form uses `book-appointment` in its webhook but explicitly sets `isTestDrive: false`; it is counted as a service lead, not a test drive. The external Codeweavers finance widget can be tracked for starts from the site's button. A completed quote inside that widget needs a documented vendor callback or a redirect to this site; do not infer completion from opening it.

No names, email addresses, phone numbers, vehicle registration numbers, free text, or finance application answers are added to the data layer.

## GA4 and Google Ads account setup

1. In each dealer GA4 property, mark the chosen conversion events as key events: `enquiry_submitted`, `finance_quote_submitted`, `click_to_call`, `whatsapp_click`, `reservation_submitted`, and `reservation_completed`. Mark `test_drive_requested` once a real test drive form is available. Also mark `view_item`, `finance_quote_started`, and `reservation_started` as key events as requested, but import these browsing and start signals as secondary conversions in Ads so bidding can prioritise completed enquiries and reservations.
2. Link that GA4 property to the dealer's Google Ads account. Create/import Google Ads conversion actions from the selected GA4 key events. Set lead and completed reservation actions as primary or secondary based on campaign goals and prevent duplicate Ads tags from counting the same action again.
3. Verify the names and counts in GA4 Realtime and Google Ads after publishing. GA4 key event and Ads conversion settings live in those accounts; code changes alone cannot mark/import them.

This setup applies to this repository. Reuse the bootstrap, banner, data layer contract, and account checklist in each other MYDV site repository and configure each dealer's own IDs.
## Shared vehicle event contract (September 2026)

Every site sends `vehicle_detail_view` with the same parameters from the listing:

| Parameter | Meaning |
| --- | --- |
| `vehicle_id` | Auto Trader stock ID (string) |
| `dealer_id` | Auto Trader advertiser ID (string) |
| `vehicle_mileage` | Odometer reading in miles (number; omitted when unknown) |
| `vehicle_make`, `vehicle_model` | Listing make and model (strings) |

Some sites also send `vehicle_year`, `value`, or `currency`. Do not use the old `stock_id` or `item_id` parameter to define the vehicle-detail custom dimension. `view_item` is a separate ecommerce event where `item_id` retains its GA4 meaning. Vehicle registration is not included in the shared event because it can identify a person.

## GA4 account handoff

For this dealer's GA4 property, after deploying and confirming a consented `vehicle_detail_view` in Realtime or DebugView:

1. In **Admin → Data display → Custom definitions**, create event-scoped dimensions for `vehicle_id`, `dealer_id`, `vehicle_make`, and `vehicle_model`. Create an event-scoped custom **metric** for numeric `vehicle_mileage` with miles as the unit. Add `vehicle_year` only where this site sends it.
2. In **Admin → Data display → Events**, mark the event names in this site's measurement plan as key events. Include `enquiry_submitted` and the successful lead or reservation events; the existing site checklist lists any additional requested events. Treat `vehicle_detail_view` as a browsing signal when deciding whether it should be a key event.
3. In **Admin → Product links → Google Ads links**, link this dealer's Ads account. Then create or import Ads conversions from the selected GA4 key events. Make completed leads/reservations primary; keep starts and clicks secondary if imported. Avoid duplicate direct Ads/GTM conversions for the same action.
4. Verify a successful and a failed form submission, one vehicle view, and a consented visit in GA4 Realtime/DebugView. Confirm the DMS reads the same GA4 property and event names. New custom definitions and key-event settings do not backfill historic reports.
