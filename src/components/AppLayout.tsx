'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DollarSign,
  ShoppingCart,
  CalendarDays,
  PieChart,
  Settings,
  Landmark,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectionBanner } from './ConnectionBanner';

const menuItems = [
  { href: '/ventas', label: 'Ventas', icon: DollarSign },
  { href: '/compras', label: 'Compras', icon: ShoppingCart },
  { href: '/compromisos', label: 'Compromisos', icon: CalendarDays },
  { href: '/presupuesto', label: 'Presupuesto', icon: PieChart },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">
              Proyección
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 px-6 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">
            {menuItems.find((item) => pathname.startsWith(item.href))?.label || ''}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <ConnectionBanner />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
