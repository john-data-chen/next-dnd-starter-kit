'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '@/lib/store';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

export interface NewTaskDialogProps {
  projectId: string;
}

export const TaskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  dueDate: z.date().optional()
});

export default function NewTaskDialog({ projectId }: NewTaskDialogProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined
    }
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    try {
      setIsSubmitting(true);
      await addTask(
        projectId,
        values.title,
        values.description ?? '',
        values.dueDate ?? null
      );
      toast.success(`New Task: ${values.title}`);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to create task: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" data-testid="new-task-trigger">
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            data-testid="new-task-form"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="Task title is required"
                      className="col-span-4"
                      autoFocus
                      data-testid="task-title-input"
                      aria-label="Task title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage data-testid="task-title-error-message" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Task Description</FormLabel>
                  <Textarea
                    id="description"
                    placeholder="Task description..."
                    className="col-span-4"
                    data-testid="task-description-input"
                    aria-label="Task description"
                    {...field}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          aria-label="Select due date"
                          className={cn(
                            'w-auto pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'yyyy-MM-dd')
                          ) : (
                            <span data-testid="task-date-picker-trigger">
                              Pick a date
                            </span>
                          )}
                          <CalendarIcon
                            className="ml-auto h-4 w-4 opacity-50"
                            aria-hidden="true"
                          />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        fromDate={new Date()}
                        initialFocus
                        data-testid="task-date-picker-calendar"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="submit-task-button"
            >
              {isSubmitting ? 'Creating...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
