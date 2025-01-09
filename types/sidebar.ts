import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  isActive?: boolean;
  items?: NavItem[];
}
