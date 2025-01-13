import { Metadata } from 'next';
import SignInViewPage from '@/components/auth/SignInView';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function Page() {
  return <SignInViewPage />;
}
