import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { DeleteTenantForm } from './DeleteTenantForm';
import { ArrowRight, Terminal, Shield, Database, Plus, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const supabase = await createClient();
  
  const { data: tenants, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });

  async function createTenant(formData: FormData) {
    'use server';
    const supabase = createAdminClient();
    const name = formData.get('name') as string;
    const rawSubdomain = formData.get('subdomain') as string;
    const subdomain = rawSubdomain.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    const { data: tenant, error } = await supabase.from('tenants').insert({ name, subdomain, is_active: true }).select().single();
    
    if (tenant && !error) {
      await supabase.from('business_settings').insert({
        tenant_id: tenant.id,
        ai_prompt: `Eres el asistente virtual experto de ${name}. Eres sumamente educado, amable y resolutivo. Tu único objetivo es agendar citas.`,
        opening_time: '09:00:00',
        closing_time: '20:00:00',
        ai_tokens_limit: 1000 // Inicializar con 1000 tokens para la prueba de 7 días
      });
    }

    if (error) console.error("Error creating tenant:", error);
    revalidatePath('/admin');
  }

  async function deleteTenant(formData: FormData) {
    'use server';
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'super_admin') return;

    const id = formData.get('id') as string;
    const adminSupabase = createAdminClient();
    await adminSupabase.from('tenants').delete().eq('id', id);
    
    revalidatePath('/admin');
    revalidatePath('/', 'layout');
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-foreground font-sans selection:bg-gold-primary/30 selection:text-gold-light p-6 md:p-12 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-primary/[0.03] rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">
              <Shield className="w-4 h-4" strokeWidth={2} />
              Zero Trust Architecture
            </div>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-white">
              Centro de <span className="italic text-gold-primary">Mando.</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base">
              Despliega nueva infraestructura para clientes en segundos. Control total sobre instancias, dominios y asignación de IA.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Instancias Activas</p>
              <p className="text-2xl font-serif text-white">{tenants?.length || 0}</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: CREAR TENANT */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 card-depth backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center mb-6">
                <Plus className="w-5 h-5 text-gold-primary" />
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">Desplegar Inquilino</h2>
              <p className="text-sm text-muted-foreground mb-8">Provisiona un nuevo entorno aislado (Tenant) con 1000 tokens iniciales.</p>

              <form action={createTenant} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gold-primary font-bold">Nombre Comercial</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    autoComplete="off"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-primary/50 focus:ring-1 focus:ring-gold-primary/50 transition-all placeholder:text-white/20" 
                    placeholder="Ej: Barbería The King" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gold-primary font-bold">Subdominio Único</label>
                  <div className="flex items-stretch">
                    <input 
                      type="text" 
                      name="subdomain" 
                      required 
                      autoComplete="off"
                      className="w-full bg-black/50 border border-white/10 border-r-0 rounded-l-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-primary/50 focus:ring-1 focus:ring-gold-primary/50 transition-all placeholder:text-white/20" 
                      placeholder="theking" 
                    />
                    <div className="bg-white/5 border border-white/10 rounded-r-xl px-4 flex items-center text-xs text-muted-foreground font-mono">
                      .{domain}
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full mt-4 btn-premium-gold px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  Crear y Provisionar
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA: LISTA DE TENANTS */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Directorio de Instancias
            </h2>

            {tenants?.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
                <p className="text-lg font-serif text-white/80">No hay inquilinos activos</p>
                <p className="text-sm text-muted-foreground mt-2">Crea tu primer negocio en el panel izquierdo.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {tenants?.map(tenant => (
                  <div key={tenant.id} className="relative group bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-gold-primary/30 transition-all card-depth">
                    {/* Status Dot */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        {tenant.is_active ? 'Online' : 'Offline'}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${tenant.is_active ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse' : 'bg-red-500'}`} />
                    </div>

                    <h3 className="font-serif text-xl text-white mb-1 pr-16 truncate">{tenant.name}</h3>
                    
                    <a 
                      href={`${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${tenant.subdomain}.${domain}${process.env.NODE_ENV === 'development' ? '?demo_admin=true' : ''}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-gold-primary/80 hover:text-gold-light mt-2 transition-colors"
                    >
                      {tenant.subdomain}.{domain}
                      <ArrowRight className="w-3 h-3" />
                    </a>

                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ID: {tenant.id.split('-')[0]}
                      </span>
                      <DeleteTenantForm tenantId={tenant.id} tenantName={tenant.name} action={deleteTenant} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
