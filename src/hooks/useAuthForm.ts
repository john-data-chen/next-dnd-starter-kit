import { defaultEmail } from '@/constants/demoData';
import { ROUTES } from '@/constants/routes';
import { useTaskStore } from '@/lib/store';
import { SignInFormValue, SignInValidation } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function useAuthForm() {
  const [loading] = useTransition();
  const { setUserInfo } = useTaskStore();

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        redirect: false
      });

      if (result?.error) {
        toast.error('Invalid email, retry again.');
        return;
      }

      toast.promise(
        new Promise((resolve) => {
          setUserInfo(data.email);
          setTimeout(() => {
            window.location.href = ROUTES.BOARDS.ROOT;
            resolve('success');
          }, 500);
        }),
        {
          loading: 'Signing in...',
          success: 'Welcome! Redirecting...',
          error: 'Authentication failed. Please try again.'
        }
      );
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('System error. Please try again later.');
    }
  };

  return {
    form,
    loading,
    onSubmit
  };
}
