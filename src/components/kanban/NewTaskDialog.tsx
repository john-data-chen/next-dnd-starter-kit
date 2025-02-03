'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '@/lib/store';
import React from 'react';

export interface NewTaskDialogProps {
  projectId: string;
  onTaskAdd?: (title: string, description: string) => void;
}

export default function NewTaskDialog({
  projectId,
  onTaskAdd
}: NewTaskDialogProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const [titleValue, setTitleValue] = React.useState('');
  const [descriptionValue, setDescriptionValue] = React.useState('');
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (typeof title !== 'string' || !title.trim()) return;

    addTask(projectId, title, description);
    onTaskAdd?.(title, description);

    // reset form
    setTitleValue('');
    setDescriptionValue('');
    setIsOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitleValue(value);
    setIsButtonDisabled(!value.trim());
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescriptionValue(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" data-testid="new-task-trigger">
          ＋ Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="new-task-dialog">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            What do you want to get done today?
          </DialogDescription>
        </DialogHeader>
        <form
          id="new-task-form"
          className="grid gap-4 py-4"
          onSubmit={handleSubmit}
          data-testid="new-task-form"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="title"
              name="title"
              placeholder="Task title is required"
              className="col-span-4"
              autoFocus
              required
              value={titleValue}
              onChange={handleTitleChange}
              data-testid="task-title-input"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Textarea
              id="description"
              name="description"
              placeholder="Description..."
              className="col-span-4"
              value={descriptionValue}
              onChange={handleDescriptionChange}
              data-testid="task-description-input"
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            form="new-task-form"
            disabled={isButtonDisabled}
            data-testid="submit-task-button"
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
