import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/app-sidebar';

export default async function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await props.params;
  const supabase = await createClient();

  // 1. Protección de ruta (Solo usuarios autenticados)
  // TEMPORAL: Comentado para poder ver la UI sin login en desarrollo
  const { data: { user }, error } = await supabase.auth.getUser();
  // if (error || !user) {
  //   redirect('/');
  // }
  
  // Usuario simulado temporal para que la UI funcione
  const mockUser = user || { email: 'admin@negocio.com' };

  // 2. Validar que el tenant existe y obtener info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) {
    redirect('/');
  }

  return (
    <div className="dark min-h-screen bg-[#0A0A0C] text-foreground font-sans selection:bg-gold-primary/30 selection:text-gold-light flex">
      <SidebarProvider>
        <AppSidebar tenant={tenant} />
        <div className="w-full flex flex-col min-h-screen relative overflow-hidden">
          {/* Ambient glows */}
          <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-gold-primary/[0.04] rounded-full blur-[100px] pointer-events-none -z-0" />
          <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-gold-primary/[0.03] rounded-full blur-[120px] pointer-events-none -z-0" />

          <header className="sticky top-0 z-40 bg-surface/40 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-6 h-16 gap-4 shadow-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            
            <div className="flex-1 flex items-center gap-4">
              {/* Modo Supervisor Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supervisor: <span className="text-emerald-400">Activo</span></span>
              </div>
            </div>

            {/* Menú de Usuario / Perfil en el Topbar */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-foreground/80 hidden sm:inline-block">{mockUser.email}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-primary to-gold-light text-[#121212] flex items-center justify-center font-bold text-sm shadow-gold-glow-sm">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 w-full relative z-10">
            {props.children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
