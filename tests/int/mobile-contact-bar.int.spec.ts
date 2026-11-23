// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let path = '/'
vi.mock('next/navigation', () => ({ usePathname: () => path }))
const { MobileContactBar } = await import('@/components/MobileContactBar')
const html = (props: { phone?: string; whatsapp?: string }) => renderToStaticMarkup(createElement(MobileContactBar, props))

// Upgrade spec: sticky Call / WhatsApp / Enquire bar on phones
describe('mobile contact bar', () => {
  it('has Call, WhatsApp and Enquire with the dealer numbers, phones only', () => {
    path = '/'
    const out = html({ phone: '07725124729', whatsapp: '447725124729' })
    expect(out).toContain('href="tel:07725124729"')
    expect(out).toContain('href="https://wa.me/447725124729"')
    expect(out).toContain('href="/contact#contact-form"')
    expect(out).toContain('lg:hidden')
  })
  it('makes a UK number international for WhatsApp when no WhatsApp number is set', () => {
    path = '/usedcars'
    expect(html({ phone: '07725 124729' })).toContain('href="https://wa.me/447725124729"')
  })
  it('is not shown on the stock admin', () => {
    path = '/stock-admin'
    expect(html({ phone: '07725124729' })).toBe('')
  })
})
