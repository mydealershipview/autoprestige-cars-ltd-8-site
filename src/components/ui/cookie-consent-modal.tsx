'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Choice = 'all' | 'analytics' | 'necessary'
const consent = (choice: Choice) => ({
  analytics_storage: choice === 'all' || choice === 'analytics' ? 'granted' : 'denied',
  ad_storage: choice === 'all' ? 'granted' : 'denied',
  ad_user_data: choice === 'all' ? 'granted' : 'denied',
  ad_personalization: choice === 'all' ? 'granted' : 'denied',
})

export default function CookieConsentModal() {
  const [visible, setVisible] = useState(false)
  const [details, setDetails] = useState(false)

  useEffect(() => {
    try {
      setVisible(!localStorage.getItem('mydv-cookie-consent') && !localStorage.getItem('cookies-accepted'))
    } catch {
      setVisible(true)
    }
    const reopen = () => setVisible(true)
    window.addEventListener('mydv:cookie-settings', reopen)
    return () => window.removeEventListener('mydv:cookie-settings', reopen)
  }, [])

  const choose = (choice: Choice) => {
    window.gtag?.('consent', 'update', consent(choice))
    try {
      localStorage.setItem('mydv-cookie-consent', choice)
      localStorage.removeItem('cookies-accepted')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl border border-white/20 bg-zinc-950 p-5 text-white shadow-2xl sm:bottom-6">
    <h2 id="cookie-title" className="text-lg font-semibold">Your cookie choices</h2>
    <p className="mt-2 text-sm text-zinc-300">We use analytics to understand site visits and advertising cookies to measure campaigns. Choose what you allow. You can change this later in the footer. <Link href="/cookie-policy" className="underline">Cookie policy</Link></p>
    {details && <p className="mt-3 text-sm text-zinc-300">Necessary keeps analytics and advertising off. Analytics allows site measurement only. Accept all also allows advertising measurement and personalisation.</p>}
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => choose('all')} className="bg-white px-4 py-2 text-sm font-semibold text-black">Accept all</button>
      <button type="button" onClick={() => choose('analytics')} className="border border-white/50 px-4 py-2 text-sm">Analytics only</button>
      <button type="button" onClick={() => choose('necessary')} className="border border-white/50 px-4 py-2 text-sm">Necessary only</button>
      <button type="button" onClick={() => setDetails(!details)} className="px-2 py-2 text-sm underline">Details</button>
    </div>
  </div>
}
