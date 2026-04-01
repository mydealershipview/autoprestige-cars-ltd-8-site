import React from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { WishlistProvider } from '@/contexts/WishlistContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = async ({ children }) => {
  const googleAnalyticsId =
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || process.env.GOOGLE_ANALYTICS_ID

  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <WishlistProvider>
          {process.env.NODE_ENV === 'production' && googleAnalyticsId && (
            <GoogleAnalytics gaId={googleAnalyticsId} />
          )}
          {children}
        </WishlistProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
