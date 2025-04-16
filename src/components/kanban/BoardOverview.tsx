'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useBoards } from '@/hooks/useBoards';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BoardActions } from './board/BoardActions';
import NewBoardDialog from './board/NewBoardDialog';

type FilterType = 'all' | 'my' | 'team';

export function BoardOverview() {
  const { myBoards, teamBoards, loading, fetchBoards } = useBoards();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (pathname === '/boards') {
      fetchBoards();
    }
  }, [pathname, fetchBoards]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBoards();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBoards]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredMyBoards = myBoards?.filter((board) =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTeamBoards = teamBoards?.filter((board) =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

  const shouldShowMyBoards = filter === 'all' || filter === 'my';
  const shouldShowTeamBoards = filter === 'all' || filter === 'team';

  const handleBoardClick = (boardId: string) => {
    router.push(`/boards/${boardId}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 bg-background sticky top-0 z-10">
        <div className="w-full sm:w-[200px]">
          <NewBoardDialog>
            <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              New Board
            </button>
          </NewBoardDialog>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-[200px]">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search boards..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filter}
            onValueChange={(value: FilterType) => setFilter(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter boards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              <SelectItem value="my">My Boards</SelectItem>
              <SelectItem value="team">Team Boards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {shouldShowMyBoards && (
            <section>
              <div className="flex items-center gap-2 mb-2 px-4">
                <h2 className="text-2xl font-bold">My Boards</h2>
              </div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <span className="text-sm text-muted-foreground">
                  (Boards which I can edit and delete)
                </span>
              </div>
              {filteredMyBoards?.length === 0 ? (
                <p className="text-muted-foreground px-4">No boards found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredMyBoards?.map((board) => (
                    <Card
                      key={board._id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleBoardClick(board._id)}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{board.title}</CardTitle>
                        <div onClick={(e) => e.stopPropagation()}>
                          <BoardActions board={board} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {board.description || 'No description'}
                        </p>
                        <p className="text-sm mt-2">
                          Projects:{' '}
                          {board.projects.length > 0
                            ? board.projects.map((p) => p.title).join(' / ')
                            : '0'}
                        </p>
                        <p className="text-sm mt-2">
                          Members: {board.members.map((m) => m.name).join(', ')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {shouldShowTeamBoards && (
            <section>
              <div className="flex items-center gap-2 mb-2 px-4">
                <h2 className="text-2xl font-bold">Team Boards</h2>
              </div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <span className="text-sm text-muted-foreground">
                  (Boards shared with me)
                </span>
              </div>
              {filteredTeamBoards?.length === 0 ? (
                <p className="text-muted-foreground px-4">
                  No team boards found.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredTeamBoards?.map((board) => (
                    <Card
                      key={board._id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleBoardClick(board._id)}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{board.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {board.description || 'No description'}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">Owner: {board.owner.name}</p>
                          <p className="text-sm">
                            Projects:{' '}
                            {board.projects.length > 0
                              ? board.projects.map((p) => p.title).join(' / ')
                              : '0'}
                          </p>
                          <p className="text-sm">
                            Members:{' '}
                            {board.members.map((m) => m.name).join(', ')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
