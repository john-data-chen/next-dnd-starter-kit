import { Suspense } from "react"

import AuthenticatedLayout from "./AuthenticatedLayout"

interface AppLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AppLayout(props: Readonly<AppLayoutProps>) {
  const { children, params } = props
  const { locale } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthenticatedLayout locale={locale}>{children}</AuthenticatedLayout>
    </Suspense>
  )
}
