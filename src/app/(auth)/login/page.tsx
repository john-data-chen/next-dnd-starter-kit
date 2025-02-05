import SignInViewPage from '@/components/auth/SignInView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next Board',
  description: 'A demo project of project management tool'
};

export default function SignInPage(): JSX.Element {
  return (
    <div data-testid="signin-page-container">
      <SignInViewPage />
    </div>
  );
}
