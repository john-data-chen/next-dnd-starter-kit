'use client';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useTaskForm } from '@/hooks/useTaskForm';
import { cn } from '@/lib/utils';
import { TaskFormSchema } from '@/types/taskForm';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { z } from 'zod';

interface TaskFormProps {
  defaultValues?: z.infer<typeof TaskFormSchema>;
  onSubmit: (values: z.infer<typeof TaskFormSchema>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Submit'
}: TaskFormProps) {
  const {
    form,
    isSubmitting,
    users,
    searchQuery,
    setSearchQuery,
    isSearching,
    assignOpen,
    setAssignOpen,
    handleSubmit
  } = useTaskForm({ defaultValues, onSubmit });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
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
                <Popover open={assignOpen} onOpenChange={setAssignOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {field.value ? field.value.name : 'Select user...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" side="bottom" align="start">
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
                              className="flex flex-col items-start"
                            >
                              <span>{user.name || user.email}</span>
                              {user.name && (
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              )}
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
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 mt-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="TODO" />
                    </FormControl>
                    <FormLabel className="font-normal">To Do</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="IN_PROGRESS" />
                    </FormControl>
                    <FormLabel className="font-normal">In Progress</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="DONE" />
                    </FormControl>
                    <FormLabel className="font-normal">Done</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
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
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="cancel-task-button"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="submit-task-button"
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
