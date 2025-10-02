import { Suspense } from 'react'
import RootWrapper from '@/components/layout/RootWrapper'
import { ROUTES } from '@/constants/routes'
import { auth } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

interface AppLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function AppLayout(props: Readonly<AppLayoutProps>) {
  const { children, params } = props
  const resolvedParams = await params
  const { locale } = resolvedParams
  const session = await auth()
  const t = await getTranslations({ locale, namespace: 'sidebar' })

  if (!session) {
    redirect(ROUTES.AUTH.LOGIN)
  }

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  )
}
