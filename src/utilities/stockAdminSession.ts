const encoder = new TextEncoder()
const MAX_AGE = 60 * 60 * 8
export const STOCK_ADMIN_COOKIE = 'stock_admin_auth'
export const stockAdminCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const,
  path: '/', maxAge: MAX_AGE,
}

async function signingKey() {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret || secret.length < 32) throw new Error('A strong PAYLOAD_SECRET is required')
  return crypto.subtle.importKey('raw', encoder.encode(`stock-admin:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('')

export async function createStockAdminSession(userId: string) {
  const body = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE }))
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(body))
  return `${body}.${hex(signature)}`
}

export async function verifyStockAdminSession(token?: string): Promise<boolean> {
  try {
    if (!token || token.length > 4096) return false
    const [body, signature, extra] = token.split('.')
    if (extra || !/^[a-f0-9]{64}$/.test(signature || '')) return false
    const bytes = Uint8Array.from(signature.match(/../g)!, b => parseInt(b, 16))
    if (!await crypto.subtle.verify('HMAC', await signingKey(), bytes, encoder.encode(body))) return false
    const data = JSON.parse(atob(body))
    const now = Math.floor(Date.now() / 1000)
    return typeof data.sub === 'string' && data.sub.length > 0 && Number.isInteger(data.exp) &&
      data.exp > now && data.exp <= now + MAX_AGE
  } catch { return false }
}
