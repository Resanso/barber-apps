
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { AppSidebarContent } from './app-sidebar-client';



async function SidebarHeaderContent() {
  'use cache'
  return <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Image src="/logos/barber-logo.png" alt="Barber App" width={44} height={44} className="rounded-md" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Trich Barberspace</span>
              <span className="truncate text-xs text-muted-foreground">
                Realtime Booking System
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>

}



async function SidebarContentWrapper() {
  const { user } = await getCachedLoggedInVerifiedSupabaseUser();
  return <AppSidebarContent user={user} />
}


export async function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeaderContent />
      <Suspense fallback={null}>
        <SidebarContentWrapper />
      </Suspense>
    </Sidebar>
  );
}
