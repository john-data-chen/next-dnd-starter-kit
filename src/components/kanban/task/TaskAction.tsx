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
  const [permissions, setPermissions] = React.useState({
    canEdit: false,
    canDelete: false
  });

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

  const defaultValues = {
    title: title,
    description: description ?? '',
    status: status ?? 'TODO',
    dueDate: dueDate ?? undefined,
    assignee: assignee ? { id: assignee, name: assigneeName } : undefined
  };

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    await updateTask(
      id,
      values.title,
      values.status,
      values.description ?? '',
      values.dueDate,
      values.assignee?.id
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
    try {
      const response = await fetch(`/api/tasks/${id}/permissions`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to check permissions');
      }

      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions({ canEdit: false, canDelete: false });
    }
  }, [id]);

  React.useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return (
    <>
      <Dialog
        open={editEnable && permissions.canEdit}
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
      {(permissions.canEdit || permissions.canDelete) && (
        <DropdownMenu modal={false}>
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
            {permissions.canEdit && (
              <DropdownMenuItem
                data-testid="edit-task-button"
                onSelect={() => {
                  setEditEnable(true);
                }}
              >
                Edit
              </DropdownMenuItem>
            )}
            {permissions.canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="delete-task-button"
                  onSelect={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <AlertDialog
        open={showDeleteDialog && permissions.canDelete}
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
