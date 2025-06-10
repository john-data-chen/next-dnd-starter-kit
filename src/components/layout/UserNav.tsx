'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export function UserNav() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // After the session is destroyed, perform a client-side redirect
    // to the correct localized login page.
    const rawLocale = params.locale;
    const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale || 'en';
    router.push(ROUTES.AUTH.LOGIN, { locale });
  };

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user?.image ?? ''}
                alt={session.user?.name ?? ''}
              />
              <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">
                {session.user?.name}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
