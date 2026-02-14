import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import React from "react"

import Providers from "@/components/layout/Providers"

export default async function MessagesProvider({
  locale,
  children
}: {
  locale: string
  children: React.ReactNode
}) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  )
}
