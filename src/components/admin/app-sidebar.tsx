'use client';

import { Calendar, Users, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar({ tenant }: { tenant: any }) {
  const items = [
    {
      title: 'Panel de Control',
      url: '/admin',
      icon: Home,
    },
    {
      title: 'Calendario',
      url: '/admin/calendar',
      icon: Calendar,
    },
    {
      title: 'Clientes',
      url: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Configuración',
      url: '/admin#configuracion',
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-black text-sidebar-foreground truncate">
          {tenant.name}
        </h2>
        <p className="text-xs text-sidebar-foreground/60">Modo Administrador</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />} tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
