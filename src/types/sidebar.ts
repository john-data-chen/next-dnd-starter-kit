import { Icons } from '@/components/layout/Icons';

export interface NavItem {
  title: string;
  icon?: keyof typeof Icons;
  url: string;
  isActive?: boolean;
  items?: NavItem[];
}
