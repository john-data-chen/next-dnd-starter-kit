import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cacheLife } from "next/cache"

import SignInView from "@/components/auth/SignInView"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "login" })

  return {
    title: t("title"),
    description: t("description")
  }
}

// This page is statically generated at build time
// oxlint-disable-next-line typescript-eslint/require-await
export default async function LoginPage() {
  "use cache"
  cacheLife("max")
  return <SignInView />
}
