/** Server-owned dealer identity and authentication; never trust form-supplied routing. */
export function getLeadConfig(reservation = false) {
  const dealerId = process.env.DEALER_ID
  const secret = process.env.EXTERNAL_NOTIFICATIONS_WEBHOOK_SECRET
  const url = reservation ? process.env.VEHICLE_RESERVATION_WEBHOOK_URL || process.env.FORM_SUBMIT_WEBHOOK_URL : process.env.FORM_SUBMIT_WEBHOOK_URL
  if (!dealerId || !secret || !url) throw new Error('DMS lead configuration is incomplete')
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' && process.env.NODE_ENV === 'production') throw new Error('DMS webhook requires HTTPS')
  return { dealerId, secret, url }
}
