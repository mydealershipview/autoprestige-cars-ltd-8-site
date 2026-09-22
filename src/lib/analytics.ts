export type AnalyticsEvent = Record<string, string | number | boolean | undefined | Array<Record<string, string | number | undefined>>>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>
    gtag?: (...args: unknown[]) => void
    __mydvDirectGa4?: boolean
  }
}

// Only send business context. Never put contact details, registration numbers,
// finance application answers, or free text into Google tags.
export function trackEvent(event: string, parameters: AnalyticsEvent = {}) {
  if (typeof window === 'undefined') return
  const data = Object.fromEntries(Object.entries(parameters).filter(([, value]) => value !== undefined))
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...data })
  if (window.__mydvDirectGa4) window.gtag?.('event', event, data)
}

export function trackLead(formType: string, extra: AnalyticsEvent = {}) {
  trackEvent('enquiry_submitted', { form_type: formType, ...extra })
  trackEvent('generate_lead', { form_type: formType, ...extra })
}
