'use client';

import { Calendar, Users, Home, Settings, CreditCard, Wallet, Sparkles } from 'lucide-react';
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

export function AppSidebar({ tenant, settings }: { tenant: TenantLite, settings?: any }) {
  const pathname = usePathname();
  
  const tokensLimit = settings?.ai_tokens_limit || 5000;
  const tokensUsed = settings?.ai_tokens_used || 0;
  const tokensRemaining = Math.max(0, tokensLimit - tokensUsed);
  const tokenPercentage = tokensLimit > 0 ? Math.min(100, Math.max(0, (tokensRemaining / tokensLimit) * 100)) : 0;

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
    <Sidebar className="border-r border-white/[0.06] bg-surface-dim/30 backdrop-blur-md">
      <SidebarHeader className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark text-[#121212] flex items-center justify-center shadow-gold-glow-sm">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-serif text-foreground truncate tracking-tight">
            {tenant.name}
          </h2>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin Panel</p>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
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

      <div className="p-4 mt-auto border-t border-white/[0.06]">
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 flex flex-col gap-3 relative overflow-hidden group">
          {/* Subtle hover glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gold-primary/0 via-gold-primary/0 to-gold-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="w-4 h-4 text-gold-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Billetera IA</span>
          </div>
          
          <div>
            <div className="text-2xl font-serif text-foreground tracking-tight leading-none">{tokensRemaining.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Tokens restantes</div>
          </div>
          
          <div className="w-full bg-white/[0.05] rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-gold-primary h-full shadow-gold-glow-sm rounded-full transition-all duration-500" style={{ width: `${tokenPercentage}%` }} />
          </div>

          <Link href="/admin/settings?tab=wallet" className="w-full mt-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            Recargar
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}
