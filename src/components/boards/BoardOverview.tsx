'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoards } from '@/hooks/useBoards';
import { useTaskStore } from '@/lib/store';

export function BoardOverview() {
  const { boards, loading } = useBoards();
  const { userEmail } = useTaskStore();

  const myBoards = boards?.filter((board) => board.owner.id === userEmail);
  const joinedBoards = boards?.filter((board) => board.owner.id !== userEmail);

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
                <p className="text-sm mt-2">Members: {board.members.length}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Joined Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {joinedBoards?.map((board) => (
            <Card key={board._id}>
              <CardHeader>
                <CardTitle>{board.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {board.description || 'No description'}
                </p>
                <p className="text-sm mt-2">Owner: {board.owner.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
