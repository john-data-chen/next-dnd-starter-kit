import { NavItem } from '@/types/sidebar';
import { ROUTES } from './routes';
import { Icons } from '@/components/layout/Icons';

export const companyInfo = {
  name: 'Next.js Template',
  logo: Icons.companyLogo
};

export const navItems: NavItem[] = [
  {
    title: 'Kanban',
    icon: 'kanban',
    url: ROUTES.KANBAN,
    shortcut: ['k', 'k'],
    isActive: true,
    items: [] // No child items
  }
];
