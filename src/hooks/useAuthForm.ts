import { defaultEmail } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { formSchema, UserFormValue } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function useAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl');
  const [loading, startTransition] = useTransition();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(() => {
      try {
        signIn('credentials', {
          email: data.email,
          callbackUrl: callbackUrl ?? ROUTES.KANBAN
        });
        toast.success('Signed In Successfully!');
      } catch {
        toast.error('Failed to sign in. Please try again.');
      }
    });
  };

  return {
    form,
    loading,
    onSubmit
  };
}
