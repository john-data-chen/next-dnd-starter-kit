'use client';

import { z } from 'zod';

export const TaskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  assignee: z.string().optional()
});
