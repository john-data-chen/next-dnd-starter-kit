'use client';

import { TaskForm } from '@/components/kanban/task/TaskForm';
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
import { useTaskStore } from '@/lib/store';
import { TaskFormSchema } from '@/types/taskForm';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import React, { useCallback } from 'react';
// Ensure useState is imported
import { toast } from 'sonner';
import { z } from 'zod';

export interface TaskActionsProps {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  description?: string;
  dueDate?: Date | null;
  assignee?: string;
  onUpdate?: (
    id: string,
    newTitle: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
    newDescription?: string,
    newDueDate?: Date | null,
    assignee?: string
  ) => void;
  onDelete?: (id: string) => void;
}

export function TaskActions({
  id,
  title,
  description,
  dueDate,
  assignee,
  status,
  onDelete
}: TaskActionsProps) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editEnable, setEditEnable] = React.useState(false);

  // Initialize permissions to null to indicate they haven't been fetched yet
  const [permissions, setPermissions] = React.useState<{
    canEdit: boolean;
    canDelete: boolean;
  } | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = React.useState(false);

  const [assigneeName, setAssigneeName] = React.useState('');

  React.useEffect(() => {
    const fetchAssigneeName = async () => {
      if (assignee) {
        try {
          const response = await fetch(
            `/api/users/search?username=${assignee}`
          );
          const data = await response.json();
          if (data.users && data.users.length > 0) {
            setAssigneeName(data.users[0].name || data.users[0].email);
          }
        } catch (error) {
          console.error('Error fetching assignee details:', error);
        }
      }
    };
    fetchAssigneeName();
  }, [assignee]);

  const defaultValues = React.useMemo(
    () => ({
      title: title,
      description: description ?? '',
      status: status ?? 'TODO',
      dueDate: dueDate ?? undefined,
      assignee: assignee
        ? { id: assignee, name: assigneeName || assignee }
        : undefined
    }),
    [title, description, status, dueDate, assignee, assigneeName]
  );

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    const assigneeId = values.assignee ? values.assignee.id : undefined;
    await updateTask(
      id,
      values.title,
      values.status,
      values.description ?? '',
      values.dueDate,
      assigneeId
    );
    toast.success(`Task is updated: ${values.title}`);
    setEditEnable(false);
  };

  const handleDelete = () => {
    setTimeout(() => (document.body.style.pointerEvents = ''), 100);
    setShowDeleteDialog(false);
    removeTask(id);
    onDelete?.(id);
    toast('Task has been deleted.');
  };

  const checkPermissions = useCallback(async () => {
    if (!id) {
      setPermissions({ canEdit: false, canDelete: false });
      return;
    }
    setIsLoadingPermissions(true);
    try {
      const response = await fetch(`/api/tasks/${id}/permissions`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check permissions');
      }

      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error checking task permissions:', error);
      setPermissions({ canEdit: false, canDelete: false }); // Fallback on error
      toast.error(
        `Could not load task permissions: ${(error as Error).message}`
      );
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [id]);

  return (
    <>
      <Dialog
        open={editEnable && !!permissions?.canEdit} // Use !! to handle null case
        onOpenChange={setEditEnable}
      >
        <DialogContent className="sm:max-w-md" data-testid="edit-task-dialog">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click submit when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => setEditEnable(false)}
            submitLabel="Update Task"
          />
        </DialogContent>
      </Dialog>
      <DropdownMenu
        modal={false}
        onOpenChange={(isOpen) => {
          // Fetch permissions only when the menu is opened for the first time
          // and permissions haven't been fetched yet (permissions is null).
          if (isOpen && permissions === null && !isLoadingPermissions) {
            checkPermissions();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="ml-1 h-8 w-12"
            data-testid="task-actions-trigger"
          >
            <span className="sr-only">Actions</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            data-testid="edit-task-button"
            onSelect={() => {
              if (permissions?.canEdit && !isLoadingPermissions) {
                setEditEnable(true);
              }
            }}
            disabled={isLoadingPermissions || !permissions?.canEdit}
            className={
              !isLoadingPermissions && !permissions?.canEdit
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : ''
            }
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-testid="delete-task-button"
            onSelect={() => {
              if (permissions?.canDelete && !isLoadingPermissions) {
                setShowDeleteDialog(true);
              }
            }}
            disabled={isLoadingPermissions || !permissions?.canDelete}
            className={`
              ${
                isLoadingPermissions || !permissions?.canDelete
                  ? 'text-muted-foreground line-through cursor-not-allowed'
                  : 'text-red-600 hover:!text-red-600 hover:!bg-destructive/10'
              }
            `}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={showDeleteDialog && !!permissions?.canDelete} // Use !! to handle null case
        onOpenChange={setShowDeleteDialog}
      >
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
