export interface NavItem {
  title: string;
  url: string;
  shortcut?: [string, string];
  isActive?: boolean;
  items?: NavItem[];
}
