import "@/styles/globals.css"

import { Analytics } from "@vercel/analytics/react"
import { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Roboto } from "next/font/google"
import { notFound } from "next/navigation"
import NextTopLoader from "nextjs-toploader"
import { Suspense } from "react"

import { routing } from "@/i18n/routing"

import MessagesProvider from "./MessagesProvider"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const roboto = Roboto({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap"
})

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("title"),
    description: t("description")
  }
}

export default async function LocaleLayout({ children, params }: Readonly<Props>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={roboto.className}>
        <NextTopLoader showSpinner={false} />
        <Suspense fallback={null}>
          <MessagesProvider locale={locale}>{children}</MessagesProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
