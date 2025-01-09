import { NavItem } from '@/types/sidebar';

export const navItems: NavItem[] = [
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: true,
    items: [] // No child items
  }
];
