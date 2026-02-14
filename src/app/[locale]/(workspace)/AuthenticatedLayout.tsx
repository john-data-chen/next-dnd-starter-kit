import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import React, { Suspense } from "react"

import RootWrapper from "@/components/layout/RootWrapper"
import { ROUTES } from "@/constants/routes"
import { auth } from "@/lib/auth"

export default async function AuthenticatedLayout({
  locale,
  children
}: {
  locale: string
  children: React.ReactNode
}) {
  const session = await auth()
  const t = await getTranslations({ locale, namespace: "sidebar" })

  if (!session) {
    redirect(ROUTES.AUTH.LOGIN)
  }

  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  )
}
