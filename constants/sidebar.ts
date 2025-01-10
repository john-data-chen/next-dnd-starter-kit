import { NavItem } from '@/types/sidebar';
import { SquareCheckBig } from 'lucide-react';

export const navItems: NavItem[] = [
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: SquareCheckBig,
    shortcut: ['k', 'k'],
    isActive: true,
    items: [] // No child items
  }
];
