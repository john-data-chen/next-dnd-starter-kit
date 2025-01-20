import { NavItem } from '@/types/sidebar';
import { ROUTES } from './routes';

export const companyInfo = {
  name: 'Next.js Template'
};

export const navItems: NavItem[] = [
  {
    title: 'Kanban',
    url: ROUTES.KANBAN,
    shortcut: ['k', 'k'],
    isActive: true,
    items: [] // No child items
  }
];
