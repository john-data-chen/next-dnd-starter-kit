import { Metadata } from 'next';
import SignInViewPage from '@/components/auth/SignInView';

export const metadata: Metadata = {
  title: 'Next Board',
  description: 'A demo project of project management tool'
};

export default function Page() {
  return <SignInViewPage />;
}
