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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBoards } from '@/hooks/useBoards';
import { useTaskStore } from '@/lib/store';
import { boardSchema } from '@/types/boardForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface NewBoardDialogProps {
  children: React.ReactNode;
}

type BoardFormData = z.infer<typeof boardSchema>;

export default function NewBoardDialog({ children }: NewBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const { addBoard, userEmail } = useTaskStore();
  const { fetchBoards } = useBoards();

  const form = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const router = useRouter();

  const handleSubmit = async (data: BoardFormData) => {
    if (!userEmail) return;

    try {
      const boardId = await addBoard(data.title, userEmail, data.description);
      toast.success('Board created successfully');
      setOpen(false);
      form.reset();
      await fetchBoards();
      router.push(`/boards/${boardId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create board');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Board Title</Label>
              <Input
                {...form.register('title')}
                placeholder="Enter board title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...form.register('description')}
                placeholder="Enter board description"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
