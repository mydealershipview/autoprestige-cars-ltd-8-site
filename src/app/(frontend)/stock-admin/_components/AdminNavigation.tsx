'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/stock-admin', label: 'Vehicles' },
  { href: '/stock-admin/reg-plates', label: 'Reg Plates' },
]

export default function AdminNavigation() {
  const pathname = usePathname()

  if (pathname.startsWith('/stock-admin/login')) {
    return null
  }

  return (
    <nav className="border-b border-white/10 bg-[#0d0d0d] px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/stock-admin'
              ? pathname === '/stock-admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-2 text-xs font-extrabold uppercase tracking-wide !transition-colors ${
                isActive
                  ? 'bg-amber-400 text-black'
                  : 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
