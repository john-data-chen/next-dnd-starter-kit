'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoards } from '@/hooks/useBoards';

export function BoardOverview() {
  const { myBoards, teamBoards, loading } = useBoards();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">My Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBoards?.map((board) => (
            <Card key={board._id}>
              <CardHeader>
                <CardTitle>{board.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {board.description || 'No description'}
                </p>
                <p className="text-sm mt-2">
                  Projects: {board.projects.length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Team Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamBoards?.map((board) => (
            <Card key={board._id}>
              <CardHeader>
                <CardTitle>{board.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {board.description || 'No description'}
                </p>
                <p className="text-sm mt-2">Owner: {board.owner.name}</p>
                <p className="text-sm mt-2">
                  Projects: {board.projects.length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
