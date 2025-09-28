import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

type Messages = typeof import('../../messages/en.json')

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const messages = ((await import(`../../messages/${locale}.json`)) as { default: Messages }).default

  return {
    locale,
    messages
  }
})
