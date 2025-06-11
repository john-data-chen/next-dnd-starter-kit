'use client';

import { Icons } from '@/components/layout/Icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { projectInfo } from '@/constants/sidebar';
import { useBoards } from '@/hooks/useBoards';
import { Link, usePathname } from '@/i18n/navigation';
import { HomeIcon } from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();
  const { myBoards, teamBoards, loading } = useBoards();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="text-sidebar-accent-foreground flex gap-2 py-2">
          <div className="bg-sidebar-pdivary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Icons.projectLogo />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{projectInfo.name}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.endsWith('/boards')}
              >
                <Link href="/boards" className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4" />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          </div>
          <SidebarMenu>
            {loading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              myBoards?.map((board) => (
                <SidebarMenuItem key={board._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.endsWith(`/boards/${board._id}`)}
                  >
                    <Link href={`/boards/${board._id}`}>
                      <span>{board.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Team Boards Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Team Boards</SidebarGroupLabel>
          </div>
          <SidebarMenu>
            {loading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              teamBoards?.map((board) => (
                <SidebarMenuItem key={board._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.endsWith(`/boards/${board._id}`)}
                  >
                    <Link href={`/boards/${board._id}`}>
                      <span>{board.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
