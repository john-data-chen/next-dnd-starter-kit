import { Metadata } from 'next';
import UserAuthForm from './user-auth-form';
import { IconPresentationAnalytics } from '@tabler/icons-react';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <IconPresentationAnalytics className="mr-2 h-6 w-6" />
          Next Board
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              This is a demo project
            </h1>
            <p className="text-sm text-muted-foreground">
              Please press Continue button, you don&apos;t need to register.
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
