import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/auth';

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect(ROUTES.HOME);
  }
}
