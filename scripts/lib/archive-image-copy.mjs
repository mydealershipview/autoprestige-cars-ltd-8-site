import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const placeholder = '433eacf795a425395f9bf90a77fd2464d50a7f434a2cc0cadb2d014069b31440'
export const sha256 = body => createHash('sha256').update(body).digest('hex')
/** @param {unknown} value @param {string | null} [resize] */
export function sourceUrl(value, resize = null) {
  if (typeof value !== 'string') return null
  let url
  try { url = new URL(value.replace('{resize}', resize || 'w1920')) } catch { return null }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
  if (!(url.hostname === 'media.autoweb.co.uk' || url.hostname === 'atcdn.co.uk' || url.hostname.endsWith('.atcdn.co.uk'))) return null
  if (resize && (url.hostname === 'atcdn.co.uk' || url.hostname.endsWith('.atcdn.co.uk')))
    url.pathname = url.pathname.replace(/(\/media\/)[^/]+\//, `$1${resize}/`)
  return url.href
}

async function readBody(response, stage) {
  if (!response.ok) throw new Error(`${stage} HTTP ${response.status}`)
  if (Number(response.headers.get('content-length')) > 25 * 1024 * 1024) throw new Error('Image too large')
  const reader = response.body.getReader()
  const chunks = []
  let length = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.length
      if (length > 25 * 1024 * 1024) throw new Error('Image too large')
      chunks.push(Buffer.from(value))
    }
  } finally { await reader.cancel().catch(() => {}) }
  return Buffer.concat(chunks)
}

async function fetchSource(href, fetcher) {
  let current = href
  for (let redirects = 0; redirects <= 3; redirects++) {
    const response = await fetcher(current, { redirect: 'manual', signal: AbortSignal.timeout(25000) })
    if (![301, 302, 303, 307, 308].includes(response.status)) return response
    const location = response.headers.get('location')
    await response.body?.cancel()
    if (!location || redirects === 3) throw new Error('Invalid or excessive source redirects')
    const target = new URL(location, current).href
    if (!sourceUrl(target)) throw new Error('Untrusted image redirect')
    if (/\/no_image\.png$/i.test(new URL(target).pathname)) throw new Error('Unavailable image placeholder')
    current = target
  }
  throw new Error('Too many image redirects')
}

export async function copyArchiveImage({ url, client, bucket, publicBase, fetcher = fetch, resize = null }) {
  const source = sourceUrl(url, resize)
  if (!source) throw new Error('Unsupported source URL')
  if (/\/no_image\.png$/i.test(new URL(source).pathname)) throw new Error('Unavailable image placeholder')
  const key = `autoprestige/legacy-sold-images/${sha256(source)}`
  const target = `${publicBase.replace(/\/$/, '')}/${key}`
  let stored
  try { stored = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })) }
  catch (error) { if (error.$metadata?.httpStatusCode !== 404) throw error }
  let checksum = stored?.Metadata?.sha256
  let bytes = stored?.ContentLength
  if (!checksum) {
    const response = await fetchSource(source, fetcher)
    const type = (response.headers.get('content-type') ?? '').split(';')[0].toLowerCase()
    const body = await readBody(response, 'Source image')
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type)) throw new Error('Invalid image content type')
    checksum = sha256(body)
    if (body.length < 1024 || checksum === placeholder) throw new Error('Unavailable image placeholder')
    const metadata = await sharp(body).metadata()
    if (!metadata.width || !metadata.height) throw new Error('Invalid image dimensions')
    bytes = body.length
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: type,
      CacheControl: 'public, max-age=31536000, immutable', Metadata: { sha256: checksum, sourcehash: sha256(source) } }))
  }
  // Verify the public delivery path, not only the storage API, before the caller changes Mongo.
  const verification = await fetcher(target, { redirect: 'error', signal: AbortSignal.timeout(25000) })
  const copied = await readBody(verification, 'Public copy')
  if (copied.length !== bytes || sha256(copied) !== checksum) throw new Error('Public copy checksum mismatch')
  return { source: url, target, sha256: checksum, bytes, reused: !!stored?.Metadata?.sha256 }
}
