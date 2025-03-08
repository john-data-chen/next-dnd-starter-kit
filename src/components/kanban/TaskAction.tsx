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
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
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
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export interface TaskActionsProps {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  assignee?: string;
  onUpdate?: (
    id: string,
    newTitle: string,
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
  onDelete
}: TaskActionsProps) {
  const userEmail = useTaskStore((state) => state.userEmail);
  const updateTask = useTaskStore((state) => state.updateTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editEnable, setEditEnable] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [AssignOpen, setAssignOpen] = React.useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
  }, [debouncedSearchQuery]);

  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: title,
      description: description ?? '',
      dueDate: dueDate ?? undefined,
      assignee: assignee ? { id: assignee } : undefined
    }
  });

  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    try {
      setIsSubmitting(true);
      await updateTask(
        id,
        values.title,
        userEmail!,
        values.description ?? '',
        values.dueDate,
        values.assignee?.id
      );
      toast.success(`Task is updated: ${values.title}`);
      form.reset();
      setEditEnable(false);
    } catch (error) {
      toast.error(`Failed to update task: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = () => {
    setTimeout(() => (document.body.style.pointerEvents = ''), 100);
    setShowDeleteDialog(false);
    removeTask(id);
    onDelete?.(id);
    toast('Task has been deleted.');
  };

  return (
    <>
      <Dialog open={editEnable} onOpenChange={setEditEnable}>
        <DialogContent className="sm:max-w-md" data-testid="edit-task-dialog">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click submit when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              data-testid="edit-task-form"
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
                                {dueDate
                                  ? format(dueDate, 'yyyy-MM-dd')
                                  : 'Select'}
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
                                {isSearching
                                  ? 'Searching...'
                                  : 'No users found.'}
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
                className="mr-2"
              >
                {isSubmitting ? 'Creating...' : 'Submit'}
              </Button>
              <Button
                type="button"
                onClick={() => setEditEnable(false)}
                data-testid="cancel-task-button"
                className="ml-2"
              >
                Cancel
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="ml-1"
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
              setEditEnable(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            data-testid="delete-task-button"
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
