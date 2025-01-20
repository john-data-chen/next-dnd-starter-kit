import * as z from 'zod';

export const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

export type UserFormValue = z.infer<typeof formSchema>;
