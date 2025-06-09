'use client';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';

interface NotFoundProps {
  onBack?: () => void;
  onHome?: () => void;
}

export function NotFoundContent({ onBack, onHome }: NotFoundProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center text-center"
      data-testid="not-found-container"
    >
      <span
        className="from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent"
        data-testid="not-found-status"
      >
        404
      </span>
      <h2
        className="font-heading my-2 text-2xl font-bold"
        data-testid="not-found-title"
      >
        Something&apos;s missing
      </h2>
      <p data-testid="not-found-message">
        Sorry, the page you are looking for doesn&apos;t exist or has been
        moved.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Button
          type="button"
          onClick={onBack}
          variant="default"
          size="lg"
          data-testid="not-found-back-button"
          aria-label="Navigate to previous page"
        >
          Go back
        </Button>
        <Button
          type="button"
          onClick={onHome}
          variant="ghost"
          size="lg"
          data-testid="not-found-home-button"
          aria-label="Navigate to home page"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default function NotFound() {
  const router = useRouter();

  return (
    <NotFoundContent
      onBack={() => router.back()}
      onHome={() => router.push(ROUTES.HOME)}
    />
  );
}
