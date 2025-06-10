import { defaultEmail } from '@/constants/demoData';
import { ROUTES } from '@/constants/routes';
import { useTaskStore } from '@/lib/store';
import { getLocalePath } from '@/lib/utils';
import { SignInFormValue, SignInValidation } from '@/types/authUserForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function useAuthForm() {
  const [isNavigating, startNavigationTransition] = useTransition(); // Updated useTransition
  const { setUserInfo } = useTaskStore();
  const router = useRouter(); // Added router instance
  const params = useParams();

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: SignInFormValue) => {
    // Define a promise that encapsulates the sign-in logic
    const signInProcessPromise = async () => {
      const result = await signIn('credentials', {
        email: data.email,
        redirect: false
      });

      if (result?.error) {
        // If signIn resolves with an error, throw an error to be caught by toast.promise's error handler
        // next-auth typically returns an error string like 'CredentialsSignin'
        if (result.error === 'CredentialsSignin') {
          throw new Error('Invalid email, retry again.');
        }
        throw new Error(result.error || 'Authentication failed.');
      }

      // If signIn is successful
      setUserInfo(data.email);
      // Do not initiate navigation here; it will be handled in the success callback of toast.promise
    };

    toast.promise(signInProcessPromise(), {
      loading: 'Authenticating...', // This is L52. It will show during the signIn API call.
      success: () => {
        // This message is displayed when signInProcessPromise resolves successfully.
        // It will appear on the current (login) page.
        // We will delay the navigation to allow the user to see this message.
        const navigationDelay = 500;

        setTimeout(() => {
          startNavigationTransition(() => {
            const locale = params.locale;
            router.push(
              `${getLocalePath(ROUTES.BOARDS.ROOT, locale)}?login_success=true`
            );
          });
        }, navigationDelay);

        return 'Authentication successful! Redirecting...'; // This is L53.
      },
      error: (err: Error) => {
        // This catches errors thrown from signInProcessPromise (e.g., from a failed signIn attempt)
        console.error('Sign-in promise error:', err);
        return err.message || 'An unknown authentication error occurred.';
      }
    });
  };

  return {
    form,
    loading: isNavigating, // Reflect navigation pending state
    onSubmit
  };
}
