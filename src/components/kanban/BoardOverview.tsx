'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBoards } from '@/hooks/useBoards'
import { usePathname, useRouter } from '@/i18n/navigation'
import { DotsHorizontalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { BoardActions } from './board/BoardActions'
import NewBoardDialog from './board/NewBoardDialog'

type FilterType = 'all' | 'my' | 'team'

export function BoardOverview() {
  const { myBoards, teamBoards, loading, fetchBoards } = useBoards()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('kanban')
  const tLogin = useTranslations('login')

  useEffect(() => {
    const loginSuccess = searchParams.get('login_success')
    if (loginSuccess === 'true') {
      const timer = setTimeout(() => {
        toast.success(tLogin('success'))
        const params = new URLSearchParams(searchParams.toString())
        params.delete('login_success')
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }, 500)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [searchParams, router, pathname, tLogin])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBoards().catch(console.error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchBoards])

  if (loading) {
    return <div>{t('loading')}</div>
  }

  const filteredMyBoards = myBoards?.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()))

  const filteredTeamBoards = teamBoards?.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()))

  const shouldShowMyBoards = filter === 'all' || filter === 'my'
  const shouldShowTeamBoards = filter === 'all' || filter === 'team'

  const handleBoardClick = (boardId: string) => {
    router.push(`/boards/${boardId}`)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="bg-background sticky top-0 z-10 flex flex-col items-start justify-between gap-2 p-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-[200px]">
          <NewBoardDialog>
            <Button
              className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              data-testid="new-board-trigger"
            >
              {t('newBoard')}
            </Button>
          </NewBoardDialog>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <MagnifyingGlassIcon className="text-muted-foreground absolute left-2.5 top-2.5 h-5 w-5" />
            <Input
              placeholder={t('searchBoards')}
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
            />
          </div>
          <Select
            value={filter}
            onValueChange={(value: FilterType) => {
              setFilter(value)
            }}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-filter-trigger">
              {' '}
              {/* Add data-testid here */}
              <SelectValue placeholder={t('filterBoards')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="selectAllBoards">
                {t('allBoards')}
              </SelectItem>
              <SelectItem value="my" data-testid="selectMyBoards">
                {t('myBoards')}
              </SelectItem>
              <SelectItem value="team" data-testid="selectTeamBoards">
                {t('teamBoards')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {shouldShowMyBoards && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-4">
                <h2 className="text-2xl font-bold" data-testid="myBoardsTitle">
                  {t('myBoards')}
                </h2>
              </div>
              <div className="mb-2 flex items-center gap-2 px-4">
                <span className="text-muted-foreground text-sm">{t('myBoardsDescription')}</span>
              </div>
              {filteredMyBoards?.length === 0 ? (
                <p className="text-muted-foreground px-4">{t('noBoardsFound')}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMyBoards?.map((board) => {
                    return (
                      <Card
                        key={board._id}
                        className="hover:border-primary cursor-pointer transition-colors"
                        onClick={() => {
                          handleBoardClick(board._id)
                        }}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="whitespace-nowrap">{board.title}</CardTitle>
                          <BoardActions board={board} asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mr-2 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }
                              }}
                              aria-label={board.title ? `${board.title} actions` : 'Board actions'}
                            >
                              <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </BoardActions>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">{board.description || t('noDescription')}</p>
                          <p className="mt-2 text-sm">
                            {t('projects')}:{' '}
                            {board.projects.length > 0 ? board.projects.map((p) => p.title).join(' / ') : '0'}
                          </p>
                          <p className="mt-2 text-sm">
                            {t('members')}: {board.members.map((m) => m.name).join(', ')}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {shouldShowTeamBoards && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-4">
                <h2 className="text-2xl font-bold" data-testid="teamBoardsTitle">
                  {t('teamBoards')}
                </h2>
              </div>
              <div className="mb-2 flex items-center gap-2 px-4">
                <span className="text-muted-foreground text-sm">{t('teamBoardsDescription')}</span>
              </div>
              {filteredTeamBoards?.length === 0 ? (
                <p className="text-muted-foreground px-4">{t('noTeamBoardsFound')}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTeamBoards?.map((board) => {
                    return (
                      <Card
                        key={board._id}
                        className="hover:border-primary cursor-pointer transition-colors"
                        onClick={() => {
                          handleBoardClick(board._id)
                        }}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="whitespace-nowrap">{board.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">{board.description || t('noDescription')}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              {t('owner')}: {board.owner.name}
                            </p>
                            <p className="text-sm">
                              {t('projects')}:{' '}
                              {board.projects.length > 0 ? board.projects.map((p) => p.title).join(' / ') : '0'}
                            </p>
                            <p className="text-sm">
                              {t('members')}: {board.members.map((m) => m.name).join(', ')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
