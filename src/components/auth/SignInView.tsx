import { projectName } from '@/constants/projectInfo';
import { Presentation } from 'lucide-react';
import UserAuthForm from './UserAuthForm';

export default function SignInViewPage() {
  return (
    <div
      role="main"
      aria-label="Sign in page"
      className="relative min-h-screen grid grid-rows-2 md:grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 lg:px-0"
    >
      <div className="bg-muted relative flex h-full flex-col p-10 text-white dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Presentation className="mr-2 h-6 w-6" />
          {projectName}
        </div>
      </div>
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              This is a demo project
            </h1>
            <p className="text-muted-foreground text-sm">
              Please press Continue button, you don&apos;t need to register.
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
