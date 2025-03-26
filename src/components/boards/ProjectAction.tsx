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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useTaskStore } from '@/lib/store';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { toast } from 'sonner';

export function ProjectActions({ title, id }: { title: string; id: string }) {
  const [newTitle, setNewTitle] = React.useState(title);
  const updateProject = useTaskStore((state) => state.updateProject);
  const removeProject = useTaskStore((state) => state.removeProject);
  const [editDisable, setIsEditDisable] = React.useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsEditDisable(!editDisable);
          updateProject(id, newTitle);
          toast(`Project title: ${title} updated to ${newTitle}`);
        }}
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="mt-0! mr-auto text-base disabled:cursor-pointer disabled:border-none disabled:opacity-100"
          disabled={editDisable}
          ref={inputRef}
        />
      </form>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="ml-1">
            <span className="sr-only">Actions</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setIsEditDisable(!editDisable);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 500);
            }}
          >
            Rename
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
              Are you sure to delete Project: {title}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              NOTE: All tasks related to project: {title} will also be deleted.
              This action can not be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                // yes, you have to set a timeout
                setTimeout(() => (document.body.style.pointerEvents = ''), 100);

                setShowDeleteDialog(false);
                removeProject(id);
                toast(`Project title: ${title} is deleted`);
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
