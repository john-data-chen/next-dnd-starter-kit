import * as z from 'zod';

export const SignInValidation = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email')
});
