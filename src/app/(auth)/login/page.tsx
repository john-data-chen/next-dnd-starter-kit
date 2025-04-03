import SignInViewPage from '@/components/auth/SignInView';
import { projectName } from '@/constants/projectInfo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: projectName,
  description: 'A demo project of project management tool'
};

export default function SignInPage(): JSX.Element {
  return (
    <div data-testid="signin-page-container">
      <SignInViewPage />
    </div>
  );
}
