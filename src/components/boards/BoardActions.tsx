'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBoards } from '@/hooks/useBoards';
import { useTaskStore } from '@/lib/store';
import { Board } from '@/types/dbInterface';
import { zodResolver } from '@hookform/resolvers/zod';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const BoardFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional()
});

interface BoardActionsProps {
  board: Board;
  onDelete?: () => void;
}

export function BoardActions({ board, onDelete }: BoardActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editEnable, setEditEnable] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { updateBoard, removeBoard } = useTaskStore();
  const router = useRouter();
  const { fetchBoards } = useBoards();
  const userEmail = useTaskStore((state) => state.userEmail);

  const form = useForm<z.infer<typeof BoardFormSchema>>({
    resolver: zodResolver(BoardFormSchema),
    defaultValues: {
      title: board.title,
      description: board.description
    }
  });

  async function onSubmit(values: z.infer<typeof BoardFormSchema>) {
    try {
      if (!userEmail) {
        toast.error('User not authenticated');
        return;
      }

      setIsSubmitting(true);
      await updateBoard(board._id, values, userEmail);
      toast.success(`Board updated: ${values.title}`);
      form.reset();
      await fetchBoards();
      setEditEnable(false);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to update board: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    try {
      if (!userEmail) {
        toast.error('User not authenticated');
        return;
      }

      await removeBoard(board._id, userEmail);
      setShowDeleteDialog(false);
      toast.success('Board has been deleted.');
      onDelete?.();
      await fetchBoards();
      router.refresh();
    } catch (error) {
      toast.error(`Failed to delete board: ${error}`);
    }
  };

  return (
    <>
      <Dialog open={editEnable} onOpenChange={setEditEnable}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogDescription>
              Make changes to your board here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditEnable(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditEnable(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure to delete board: {board.title}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All projects and tasks in this board
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
