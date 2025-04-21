'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useBoards } from '@/hooks/useBoards';
import { useTaskStore } from '@/lib/store';
import { boardSchema } from '@/types/boardForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { BoardForm } from './BoardForm';

interface NewBoardDialogProps {
  children: React.ReactNode;
}

type BoardFormData = z.infer<typeof boardSchema>;

export default function NewBoardDialog({ children }: NewBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const { addBoard } = useTaskStore();
  const { fetchBoards } = useBoards();
  const router = useRouter();

  const handleSubmit = async (data: BoardFormData) => {
    try {
      const boardId = await addBoard(data.title, data.description);
      toast.success('Board created successfully');
      setOpen(false);
      await fetchBoards();
      router.push(`/boards/${boardId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create board');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} data-testid="new-board-dialog">
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle data-testid="new-board-dialog-title">
            Create New Board
          </DialogTitle>
        </DialogHeader>
        <BoardForm onSubmit={handleSubmit}>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-testid="cancel-button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="create-button">
              Create
            </Button>
          </DialogFooter>
        </BoardForm>
      </DialogContent>
    </Dialog>
  );
}
