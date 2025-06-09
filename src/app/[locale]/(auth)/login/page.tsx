import SignInViewPage from '@/components/auth/SignInView';
import { projectMetaData } from '@/constants/pageMetaData';
import { Metadata } from 'next';
import type { JSX } from 'react';

export const metadata: Metadata = {
  title: projectMetaData.title,
  description: projectMetaData.description
};

export default function SignInPage(): JSX.Element {
  return (
    <div data-testid="signin-page-container">
      <SignInViewPage />
    </div>
  );
}
