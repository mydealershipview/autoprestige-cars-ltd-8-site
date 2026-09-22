import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { WishlistProvider } from '@/contexts/WishlistContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = async ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
