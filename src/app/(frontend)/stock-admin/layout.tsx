import type { Metadata } from 'next'
import AdminNavigation from './_components/AdminNavigation'

export const metadata: Metadata = {
  title: 'Stock Admin',
  robots: { index: false, follow: false },
}

export default function StockAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <AdminNavigation />
      {children}
    </div>
  )
}
