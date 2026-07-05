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
    <SidebarProvider>
      <AppSidebar tenant={tenant} />
      <div className="w-full flex flex-col min-h-screen bg-[#F8F9FA] font-sans text-neutral-900">
        <header className="bg-white sticky top-0 z-40 border-b border-neutral-200 shadow-sm flex items-center px-6 h-16 gap-4">
          <SidebarTrigger />
          <div className="flex-1">
            {/* Breadcrumbs o acciones extra irían aquí */}
          </div>
          {/* Menú de Usuario / Perfil en el Topbar */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-600">{mockUser.email}</span>
            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 w-full relative">
          {props.children}
        </main>
      </div>
    </SidebarProvider>
  );
}
