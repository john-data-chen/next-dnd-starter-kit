import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  shortcut?: [string, string];
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}
