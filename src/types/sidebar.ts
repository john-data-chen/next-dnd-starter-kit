import { Icons } from '@/components/layout/Icons';

export interface NavItem {
  title: string;
  icon?: keyof typeof Icons;
  url: string;
  shortcut?: [string, string];
  isActive?: boolean;
  items?: NavItem[];
}
