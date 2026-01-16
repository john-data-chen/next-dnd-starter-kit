import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import { routing } from "./routing"

type Messages = typeof import("../../messages/en.json")

async function importMessages(locale: string): Promise<Messages> {
  return (await import(`../../messages/${locale}.json`)).default as Messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const messages = await importMessages(locale)

  return {
    locale,
    messages
  }
})
