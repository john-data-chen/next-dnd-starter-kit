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
import { projectSchema } from '@/types/projectForm';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { ProjectForm } from './ProjectForm';

interface ProjectActionsProps {
  id: string;
  title: string;
  description?: string;
}

export function ProjectActions({
  id,
  title,
  description
}: ProjectActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editEnable, setEditEnable] = React.useState(false);
  const updateProject = useTaskStore((state) => state.updateProject);
  const removeProject = useTaskStore((state) => state.removeProject);
  const currentBoardId = useTaskStore((state) => state.currentBoardId);
  const fetchProjects = useTaskStore((state) => state.fetchProjects);

  type ProjectFormData = z.infer<typeof projectSchema>;

  async function onSubmit(values: ProjectFormData) {
    try {
      await updateProject(id, values.title, values.description);
      await fetchProjects(currentBoardId!);
      toast.success('Project is updated!');
      setEditEnable(false);
    } catch (error) {
      toast.error('Project updated fail：' + (error as Error).message);
    }
  }

  return (
    <>
      <Dialog open={editEnable} onOpenChange={setEditEnable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={onSubmit}
            defaultValues={{ title, description }}
          >
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditEnable(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </ProjectForm>
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-12"
            data-testid="project-option-button"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => setEditEnable(true)}
            data-testid="edit-project-button"
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
            data-testid="delete-project-button"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Make sure before you delete Project： {title}？
            </AlertDialogTitle>
            <AlertDialogDescription>
              Warning: This action will delete All Tasks in project and it
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false);
                removeProject(id);
                toast.success(`Project: ${title} is deleted`);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
