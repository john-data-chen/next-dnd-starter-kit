import { defaultEmail } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { formSchema, UserFormValue } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function useAuthForm() {
  const [loading, startTransition] = useTransition();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: UserFormValue) => {
    try {
      console.log('Signing in with email:', data.email);

      startTransition(() => {
        signIn('credentials', {
          email: data.email,
          redirect: true,
          callbackUrl: ROUTES.KANBAN
        })
          .then((result) => {
            console.log('Sign in result:', result);

            if (result?.error) {
              console.error('Sign in error: ', result.error);
              toast.error('Failed to sign in. Please try again.');
              return;
            }

            toast.success('Signed In Successfully!');
          })
          .catch((error) => {
            console.error('Unexpected error:', error);
            toast.error('Failed to sign in. Please try again.');
          });
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form.');
    }
  };

  return {
    form,
    loading,
    onSubmit
  };
}
