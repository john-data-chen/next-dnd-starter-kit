'use client';

import { TaskForm } from '@/components/boards/TaskForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useTaskStore } from '@/lib/store';
import { TaskFormSchema } from '@/types/taskForm';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export interface NewTaskDialogProps {
  projectId: string;
}

export default function NewTaskDialog({ projectId }: NewTaskDialogProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    await addTask(
      projectId!,
      values.title!,
      values.status!,
      values.description ?? '',
      values.dueDate ?? undefined,
      values.assignee?.id ?? undefined
    );
    toast.success(`New Task: ${values.title}`);
    setAddTaskOpen(false);
  };

  return (
    <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          data-testid="new-task-trigger"
          className="my-4 w-full"
        >
          ＋ Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="new-task-dialog">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            What do you want to get done today?
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          submitLabel="Create Task"
          onCancel={() => setAddTaskOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
