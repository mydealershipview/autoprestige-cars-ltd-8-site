// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { soldImageURL } from '@/utilities/soldImageURL'
afterEach(() => vi.unstubAllEnvs())
it('maps R2 archive paths to the configured custom domain without altering other images', () => {
  vi.stubEnv('SOLD_IMAGES_PUBLIC_BASE_URL', 'https://photos.example.com')
  expect(soldImageURL('https://pub-bucket.r2.dev/archive/car%20one.jpg')).toBe('https://photos.example.com/archive/car%20one.jpg')
  expect(soldImageURL('https://m.atcdn.co.uk/{resize}/car.jpg')).toBe('https://m.atcdn.co.uk/w800/car.jpg')
})
it('preserves current photos until the bucket custom domain is configured and rejects unsafe targets', () => {
  vi.stubEnv('SOLD_IMAGES_PUBLIC_BASE_URL', '')
  expect(soldImageURL('https://pub-bucket.r2.dev/archive/car.jpg')).toBe('https://pub-bucket.r2.dev/archive/car.jpg')
  vi.stubEnv('SOLD_IMAGES_PUBLIC_BASE_URL', 'http://photos.example.com')
  expect(() => soldImageURL('https://pub-bucket.r2.dev/archive/car.jpg')).toThrow()
})
