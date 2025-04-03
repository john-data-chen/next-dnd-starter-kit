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
  const [loading, startTransition] = useTransition();
  const { setUserInfo } = useTaskStore();

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    try {
      startTransition(() => {
        signIn('credentials', {
          email: data.email,
          redirect: true,
          callbackUrl: ROUTES.BOARDS.ROOT
        }).catch((error) => {
          console.error('Authentication error:', error);
          toast.error('Failed to sign in. Please try again.');
        });
      });

      setUserInfo(data.email);
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
