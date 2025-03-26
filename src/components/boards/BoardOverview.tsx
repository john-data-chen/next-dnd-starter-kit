'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoards } from '@/hooks/useBoards';
import { useTaskStore } from '@/lib/store';
import { useEffect } from 'react';
import { BoardActions } from './BoardActions';

export function BoardOverview() {
  const { myBoards, teamBoards, loading } = useBoards();
  const setCurrentBoardId = useTaskStore((state) => state.setCurrentBoardId);

  useEffect(() => {
    setCurrentBoardId('');
    return () => {
      setCurrentBoardId('');
    };
  }, [setCurrentBoardId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">My Boards</h2>
          <span className="text-sm text-muted-foreground">
            (Boards you own)
          </span>
        </div>
        {myBoards?.length === 0 ? (
          <p className="text-muted-foreground">
            You haven&apos;t created any boards yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBoards?.map((board) => (
              <Card key={board._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{board.title}</CardTitle>
                  <BoardActions board={board} />
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

      <section>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">Team Boards</h2>
          <span className="text-sm text-muted-foreground">
            (Boards shared with you)
          </span>
        </div>
        {teamBoards?.length === 0 ? (
          <p className="text-muted-foreground">
            You haven&apos;t been added to any team boards yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamBoards?.map((board) => (
              <Card key={board._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{board.title}</CardTitle>
                  <BoardActions board={board} />
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
                      Members: {board.members.map((m) => m.name).join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
