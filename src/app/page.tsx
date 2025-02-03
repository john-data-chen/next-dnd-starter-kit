import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default async function RootPage() {
  const session = await auth();

  if (!session) redirect(ROUTES.AUTH.LOGIN);

  return redirect(ROUTES.KANBAN);
}
