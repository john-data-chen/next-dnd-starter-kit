'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const BoardFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional()
});

type BoardFormValues = z.infer<typeof BoardFormSchema>;

interface BoardFormProps {
  defaultValues?: Partial<BoardFormValues>;
  onSubmit: (values: BoardFormValues) => Promise<void>;
  children?: React.ReactNode;
}

export function BoardForm({
  defaultValues,
  onSubmit,
  children
}: BoardFormProps) {
  const form = useForm<BoardFormValues>({
    resolver: zodResolver(BoardFormSchema),
    defaultValues: {
      title: '',
      description: '',
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter board title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter board description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}
