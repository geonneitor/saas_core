import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { DeleteTenantForm } from './DeleteTenantForm';
import { ArrowRight } from 'lucide-react';

export default async function AdminPage() {
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const supabase = await createClient();
  
  // Fetch existing tenants
  const { data: tenants, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });

  // Server Action to create a new tenant
  async function createTenant(formData: FormData) {
    'use server';
    const supabase = createAdminClient();
    const name = formData.get('name') as string;
    const rawSubdomain = formData.get('subdomain') as string;
    // Extraer solo la parte del subdominio limpio
    const subdomain = rawSubdomain.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    const { data: tenant, error } = await supabase.from('tenants').insert({ name, subdomain, is_active: true }).select().single();
    
    // Automatically create default settings for the AI Assistant
    if (tenant && !error) {
      await supabase.from('business_settings').insert({
        tenant_id: tenant.id,
        ai_prompt: `Eres el asistente virtual experto de ${name}. Eres sumamente educado, amable y resolutivo. Tu único objetivo es agendar citas.`,
        opening_time: '09:00:00',
        closing_time: '20:00:00'
      });
    }

    if (error) console.error("Error creating tenant:", error);
    revalidatePath('/admin');
  }

  // Server Action to delete a tenant
  async function deleteTenant(formData: FormData) {
    'use server';
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[deleteTenant] No auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'super_admin') {
      console.error('[deleteTenant] Not super-admin');
      return;
    }

    const id = formData.get('id') as string;
    
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('tenants').delete().eq('id', id);
    if (error) console.error("Error deleting tenant:", error);
    revalidatePath('/home/admin');
    revalidatePath('/', 'layout');
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel SuperAdmin</h1>
        <p className="text-muted-foreground">Gestiona tus inquilinos y sus accesos.</p>
      </div>
      
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Negocio</h2>
        <form action={createTenant} className="flex gap-4 items-end flex-wrap">
          <div className="grid gap-2 flex-1 min-w-50">
            <label className="text-sm font-medium">Nombre Comercial</label>
            <input type="text" name="name" required className="border rounded-md p-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Barbería Los Jefes" />
          </div>
          <div className="grid gap-2 flex-1 min-w-50">
            <label className="text-sm font-medium">Dominio de Acceso</label>
            <input type="text" name="subdomain" required className="border rounded-md p-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="losjefes.localhost" />
          </div>
          <Button type="submit" className="w-full sm:w-auto font-semibold">Dar de Alta</Button>
        </form>
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Negocios Activos ({tenants?.length || 0})</h2>
        {tenants?.length === 0 && (
          <p className="text-muted-foreground text-sm">No tienes inquilinos aún. ¡A vender!</p>
        )}
        {tenants?.map(tenant => (
          <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:border-primary/50 transition-colors">
            <div>
              <p className="font-semibold text-lg">{tenant.name}</p>
              <a 
                href={`${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${tenant.subdomain}.${domain}${process.env.NODE_ENV === 'development' ? '?demo_admin=true' : ''}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-500 hover:underline flex items-center gap-2"
              >
                {tenant.subdomain}.{domain}
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2 items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${tenant.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                {tenant.is_active ? 'Activo' : 'Suspendido'}
              </span>
              <DeleteTenantForm tenantId={tenant.id} tenantName={tenant.name} action={deleteTenant} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
