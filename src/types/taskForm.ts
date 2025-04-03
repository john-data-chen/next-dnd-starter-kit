'use client';

import { z } from 'zod';

export const TaskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  assignee: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .optional()
});
