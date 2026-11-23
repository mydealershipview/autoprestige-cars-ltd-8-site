/**
 * Website alerts ("notify me when one arrives", "tell me if the price drops") create DMS leads, so they
 * are off unless the dealer has asked for them: set NEXT_PUBLIC_STOCK_ALERTS_ENABLED=true to show them.
 * Filters, counts, Save and the shortlist comparison are not affected.
 */
export const stockAlertsEnabled = () => process.env.NEXT_PUBLIC_STOCK_ALERTS_ENABLED === 'true'

/** Shown beside the submit button on both alert forms (Habib's wording). */
export const STOCK_ALERT_CONSENT = "We'll only contact you about this car or similar vehicles."
