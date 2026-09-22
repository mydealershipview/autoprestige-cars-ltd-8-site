'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export default function Analytics({ directGa4 }: { directGa4: boolean }) {
  const pathname = usePathname()

  useEffect(() => {
    window.__mydvDirectGa4 = directGa4
  }, [directGa4])

  useEffect(() => {
    if (pathname) trackEvent('mydv_page_view', { page_path: pathname })
  }, [pathname])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      const href = link.href.toLowerCase()
      if (href.startsWith('tel:')) trackEvent('click_to_call', { link_location: window.location.pathname })
      if (href.includes('wa.me/') || href.includes('api.whatsapp.com/')) {
        trackEvent('whatsapp_click', { link_location: window.location.pathname })
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
