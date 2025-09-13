'use client'

import React from 'react'
import { SessionProvider, SessionProviderProps } from 'next-auth/react'
import ThemeProvider from './ThemeProvider'

export default function Providers({
  session,
  children
}: {
  session: SessionProviderProps['session']
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>{children}</SessionProvider>
    </ThemeProvider>
  )
}
