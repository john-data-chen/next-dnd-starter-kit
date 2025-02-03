'use client';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTaskStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface TaskActionsProps {
  title: string;
  id: string;
  onUpdate?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskActions({
  title,
  id,
  onUpdate,
  onDelete
}: TaskActionsProps) {
  const [name, setName] = React.useState(title);
  const updateTask = useTaskStore((state) => state.updateTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const [editDisable, setIsEditDisable] = React.useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsEditDisable(true);
    updateTask(id, name);
    onUpdate?.(id, name);
    toast(`Task ${title} updated to ${name}`);
  };

  const handleDelete = () => {
    setTimeout(() => (document.body.style.pointerEvents = ''), 100);
    setShowDeleteDialog(false);
    removeTask(id);
    onDelete?.(id);
    toast('Task has been deleted.');
  };

  return (
    <>
      <form onSubmit={handleUpdate} data-testid="task-edit-form">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-0! mr-auto text-base disabled:cursor-pointer disabled:border-none disabled:opacity-100"
          disabled={editDisable}
          ref={inputRef}
          data-testid="task-title-input"
        />
      </form>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="ml-1"
            data-testid="task-actions-trigger"
          >
            <span className="sr-only">Actions</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            data-testid="rename-task-button"
            onSelect={() => {
              setIsEditDisable(false);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 500);
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            data-testid="delete-task-button"
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="delete-task-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure to delete Task: {title}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              NOTE: Task: {title} will also be deleted. This action can not be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-button">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-testid="confirm-delete-button"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
