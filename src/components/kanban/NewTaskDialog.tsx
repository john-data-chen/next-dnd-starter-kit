'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList
} from '@/components/ui/command';
import { CommandItem } from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/useDebounce';
import { useTaskStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { User } from '@/types/dbInterface';
import { TaskFormSchema } from '@/types/taskForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export interface NewTaskDialogProps {
  projectId: string;
}

export default function NewTaskDialog({ projectId }: NewTaskDialogProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const userEmail = useTaskStore((state) => state.userEmail);
  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined,
      assignee: undefined
    }
  });
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [AssignOpen, setAssignOpen] = React.useState(false);

  const searchUsers = async (search: string) => {
    try {
      const response = await fetch(`/api/users/search?username=${search}`);
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    try {
      setIsSubmitting(true);
      await addTask(
        projectId!,
        userEmail!,
        values.title!,
        values.description ?? '',
        values.dueDate ?? undefined,
        values.assignee?.id ?? undefined
      );
      toast.success(`New Task: ${values.title}`);
      form.reset();
      setAddTaskOpen(false);
    } catch (error) {
      toast.error(`Failed to create task: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const [users, setUsers] = React.useState<User[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearchQuery) {
        setIsSearching(true);
        try {
          const results = await searchUsers(debouncedSearchQuery);
          setUsers(results);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [debouncedSearchQuery, projectId]);

  return (
    <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
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
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Assign to?</FormLabel>
                  <FormControl>
                    <Popover open={AssignOpen} onOpenChange={setAssignOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {field.value ? field.value.name : 'Select user...'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        side="bottom"
                        align="start"
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search users..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {isSearching ? 'Searching...' : 'No users found.'}
                            </CommandEmpty>
                            <CommandGroup>
                              {users.map((user) => (
                                <CommandItem
                                  key={user._id}
                                  value={user._id}
                                  onSelect={() => {
                                    field.onChange({
                                      id: user._id,
                                      name: user.name || user.email
                                    });
                                    setAssignOpen(false);
                                  }}
                                >
                                  {user.name || user.email}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
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
