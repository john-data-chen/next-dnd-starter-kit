import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect(ROUTES.HOME);
  }
}
