'use client';

import { Calendar, Users, Home, Settings, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface TenantLite {
  id: string;
  name: string;
  subdomain: string;
}

export function AppSidebar({ tenant }: { tenant: TenantLite }) {
  const pathname = usePathname();

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
      title: 'Facturación',
      url: '/admin/billing',
      icon: CreditCard,
    },
    {
      title: 'Configuración',
      url: '/admin/settings',
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
              {items.map((item) => {
                const href = `/admin${item.url === '/admin' ? '' : item.url.replace('/admin', '')}`;
                const isActive = pathname === href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
