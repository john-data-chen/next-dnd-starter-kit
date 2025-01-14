'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface NotFoundProps {
  onBack?: () => void;
  onHome?: () => void;
}

export function NotFoundContent({ onBack, onHome }: NotFoundProps) {
  return (
    <div
      className="absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center"
      data-testid="not-found-container"
    >
      <span
        className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent"
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
          onClick={onBack}
          variant="default"
          size="lg"
          data-testid="not-found-back-button"
        >
          Go back
        </Button>
        <Button
          onClick={onHome}
          variant="ghost"
          size="lg"
          data-testid="not-found-home-button"
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
      onHome={() => router.push('/dashboard')}
    />
  );
}
