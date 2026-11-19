/**
 * Report a fixed event code only: no customer data, feed URLs, keys or provider responses.
 * The console line is what GlitchTip receives: src/instrumentation.ts reports console errors and
 * warnings, labels them [Auto Prestige] and strips personal fields (src/utilities/monitoring.ts).
 */
export async function reportOperationalError(code: string) {
  console.error(`[dealer-site] ${code}`)
}
