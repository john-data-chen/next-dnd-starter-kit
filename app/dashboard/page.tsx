import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/auth';

export default async function Dashboard() {
  try {
    const session = await auth();
    if (!session?.user) {
      return redirect(ROUTES.HOME);
    }
    return redirect(ROUTES.KANBAN);
  } catch (error) {
    console.error('Authentication failed:', error);
    return redirect(ROUTES.AUTH_ERROR);
  }
}
