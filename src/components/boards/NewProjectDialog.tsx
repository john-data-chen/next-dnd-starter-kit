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
import { useTaskStore } from '@/lib/store';
import React from 'react';

export interface NewProjectDialogProps {
  onProjectAdd?: (title: string) => void;
}

export default function NewProjectDialog({
  onProjectAdd
}: NewProjectDialogProps = {}) {
  const addProject = useTaskStore((state) => state.addProject);
  const userEmail = useTaskStore((state) => state.userEmail);
  const [inputValue, setInputValue] = React.useState('');
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { title } = Object.fromEntries(formData);

    if (typeof title !== 'string' || !title.trim()) return;

    addProject(title, userEmail!);
    onProjectAdd?.(title);
    setInputValue('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsButtonDisabled(!value.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          data-testid="new-project-trigger"
        >
          ＋ Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="new-project-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>What project you want to add?</DialogDescription>
        </DialogHeader>
        <form
          id="new-project-form"
          className="grid gap-4 py-4"
          onSubmit={handleSubmit}
          data-testid="new-project-form"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="title"
              name="title"
              placeholder="Project title is required"
              className="col-span-4"
              autoFocus
              required
              value={inputValue}
              onChange={handleInputChange}
              data-testid="project-title-input"
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            form="new-project-form"
            disabled={isButtonDisabled}
            data-testid="submit-project-button"
          >
            Add Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
