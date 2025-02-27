import { defaultEmail } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { SignInFormValue, SignInValidation } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function useAuthForm() {
  const [loading, startTransition] = useTransition();

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    try {
      console.log('Signing in with email:', data.email);

      startTransition(() => {
        signIn('credentials', {
          email: data.email,
          redirect: false,
          callbackUrl: ROUTES.KANBAN
        })
          .then((result) => {
            console.log('Sign in result:', result);

            if (result?.error) {
              console.error('Sign in error: ', result.error);
              toast.error('Failed to sign in. Reloading in 5 seconds...');
              setTimeout(() => {
                window.location.href = ROUTES.AUTH.LOGIN;
              }, 5000);

              return;
            }

            window.location.href = ROUTES.KANBAN;
            toast.success('Signed In Successfully!');
          })
          .catch((error) => {
            console.error('Unexpected error:', error);
            toast.error('Failed to sign in. Please try again.');

            setTimeout(() => {
              window.location.href = ROUTES.AUTH.LOGIN;
            }, 5000);
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
