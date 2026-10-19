import { describe, expect, it, vi } from 'vitest'
import sharp from 'sharp'
import { copyArchiveImage, sha256, sourceUrl } from '../../scripts/lib/archive-image-copy.mjs'

const photo = () => sharp(Buffer.from(Array.from({ length: 128 * 128 * 3 }, (_, i) => (i * 7919 + i % 97) % 256)), { raw: { width: 128, height: 128, channels: 3 } }).jpeg().toBuffer()
const source = 'https://m.atcdn.co.uk/a/media/{resize}/test.jpg'
const response = (body: Buffer) => new Response(body, { headers: { 'content-type': 'image/jpeg' } })
const settings = { url: source, bucket: 'images', publicBase: 'https://photos.example.com' }

describe('verified archive image copying', () => {
  it('allows only the two source providers over HTTPS', () => {
    expect(sourceUrl(source)).toContain('/w1920/')
    expect(sourceUrl(source, 'w1024h768')).toContain('/w1024h768/')
    expect(sourceUrl('https://media.autoweb.co.uk/media/images/1/photo.jpg', 'w1024h768')).toBe('https://media.autoweb.co.uk/media/images/1/photo.jpg')
    expect(sourceUrl('https://media.autoweb.co.uk/media/images/1/photo.jpg')).toBeTruthy()
    for (const value of ['http://m.atcdn.co.uk/a.jpg', 'https://m.atcdn.co.uk.evil.com/a.jpg', 'https://user:pass@m.atcdn.co.uk/a.jpg', 'https://localhost/a.jpg']) expect(sourceUrl(value)).toBeNull()
  })
  it('uploads and verifies identical publicly accessible bytes before returning a replacement', async () => {
    const image = await photo()
    const client = { send: vi.fn().mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } }).mockResolvedValue({}) }
    const fetcher = vi.fn().mockResolvedValueOnce(response(image)).mockResolvedValueOnce(response(image))
    const result = await copyArchiveImage({ ...settings, client, fetcher })
    expect(result.sha256).toBe(sha256(image))
    expect(result.target).toContain('https://photos.example.com/autoprestige/legacy-sold-images/')
    expect(client.send).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[0][1].redirect).toBe('manual')
  })
  it('follows a provider resize redirect and verifies the resulting image', async () => {
    const image = await photo()
    const client = { send: vi.fn().mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } }).mockResolvedValue({}) }
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://m.atcdn.co.uk/a/media/w1792/test.jpg' } })).mockResolvedValueOnce(response(image)).mockResolvedValueOnce(response(image))
    expect((await copyArchiveImage({ ...settings, client, fetcher })).sha256).toBe(sha256(image))
    expect(fetcher.mock.calls[1][0]).toContain('/w1792/')
  })
  it('rejects redirects outside the trusted provider hosts before downloading or uploading', async () => {
    const client = { send: vi.fn().mockRejectedValue({ $metadata: { httpStatusCode: 404 } }) }
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://localhost/private' } }))
    await expect(copyArchiveImage({ ...settings, client, fetcher })).rejects.toThrow('Untrusted image redirect')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(client.send).toHaveBeenCalledTimes(1)
  })
  it('rejects the provider unavailable-photo redirect before saving a placeholder', async () => {
    const client = { send: vi.fn().mockRejectedValue({ $metadata: { httpStatusCode: 404 } }) }
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 307, headers: { location: '/a/media/w1792/no_image.png' } }))
    await expect(copyArchiveImage({ ...settings, client, fetcher })).rejects.toThrow('Unavailable image placeholder')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(client.send).toHaveBeenCalledTimes(1)
  })
  it('reuses a verified existing object instead of downloading the source again', async () => {
    const image = await photo()
    const client = { send: vi.fn().mockResolvedValue({ Metadata: { sha256: sha256(image) }, ContentLength: image.length }) }
    const fetcher = vi.fn().mockResolvedValue(response(image))
    expect((await copyArchiveImage({ ...settings, client, fetcher })).reused).toBe(true)
    expect(client.send).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][0]).toContain('photos.example.com')
  })
  it('never returns a replacement for an expired source or mismatching public copy', async () => {
    const client = { send: vi.fn().mockRejectedValue({ $metadata: { httpStatusCode: 404 } }) }
    await expect(copyArchiveImage({ ...settings, client, fetcher: vi.fn().mockResolvedValue(new Response('', { status: 404 })) })).rejects.toThrow('HTTP 404')
    const image = await photo()
    const upload = { send: vi.fn().mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } }).mockResolvedValue({}) }
    await expect(copyArchiveImage({ ...settings, client: upload, fetcher: vi.fn().mockResolvedValueOnce(response(image)).mockResolvedValueOnce(response(Buffer.from('wrong image'))) })).rejects.toThrow('checksum mismatch')
  })
  it('does not hide storage authorization failures or upload HTML as a photograph', async () => {
    await expect(copyArchiveImage({ ...settings, client: { send: vi.fn().mockRejectedValue(new Error('Storage denied')) } })).rejects.toThrow('Storage denied')
    const client = { send: vi.fn().mockRejectedValue({ $metadata: { httpStatusCode: 404 } }) }
    await expect(copyArchiveImage({ ...settings, client, fetcher: vi.fn().mockResolvedValue(new Response('<html>not an image</html>')) })).rejects.toThrow('Invalid image content type')
    expect(client.send).toHaveBeenCalledTimes(1)
  })
})
