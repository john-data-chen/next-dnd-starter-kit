import { Icons } from '@/components/layout/Icons';
import { NavItem } from '@/types/sidebar';
import { ROUTES } from './routes';

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
