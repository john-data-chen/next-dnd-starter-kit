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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '@/lib/store';
import { projectSchema } from '@/types/projectForm';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export interface NewProjectDialogProps {
  onProjectAdd?: (title: string, description?: string) => void;
}

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectDialog({
  onProjectAdd
}: NewProjectDialogProps) {
  const addProject = useTaskStore((state) => state.addProject);
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const projectId = await addProject(data.title, data.description || '');
      if (!projectId) {
        toast.error('Failed to create project');
        return;
      }
      onProjectAdd?.(data.title, data.description);
      toast.success('Project created successfully');
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create project');
    }
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
          onSubmit={form.handleSubmit(handleSubmit)}
          data-testid="new-project-form"
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                {...form.register('title')}
                placeholder="Project title is required"
                data-testid="project-title-input"
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
                placeholder="Enter project description"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-project-button">
              Add Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
