import { BoardOverview } from '@/components/kanban/BoardOverview'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const { locale } = resolvedParams
  const t = await getTranslations({ locale, namespace: 'kanban' })

  return {
    title: t('title'),
    description: t('description')
  }
}

export default function BoardPage() {
  return <BoardOverview />
}
