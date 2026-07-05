import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, Users, Activity, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const domain = params.domain;
  const supabase = await createClient();

  // Validar Inquilino y traer configuraciones
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, business_settings(*)')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) {
    notFound();
  }

  // Traer citas del día actual
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, customers(name, phone)')
    .eq('tenant_id', tenant.id)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true });

  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
  const aiAvatar = settings?.ai_avatar || 'lotito';

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans selection:bg-primary selection:text-on-primary">
      <header className="px-6 pt-10 pb-6 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border mb-8">
        <div>
          <Link href={`http://${domain}.localhost:3000`} className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4 hover:text-foreground transition-colors w-fit">
            <ArrowRight className="w-3 h-3 rotate-180" />
            Volver a la Web Pública
          </Link>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-primary font-semibold font-sans mb-3 flex items-center gap-2">
            <Settings className="w-3 h-3" strokeWidth={2} />
            PANEL DE CONTROL: {tenant.name}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight leading-none">
            Visión General
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-10">
        
        {/* Resumen / KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-depth p-6 rounded-3xl flex items-center justify-between gap-5 transition-shadow group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-surface-bright border border-border text-gold-primary rounded-2xl flex items-center justify-center shadow-gold-glow-sm">
                <Calendar size={24} className="stroke-[1.5px]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Citas Hoy</p>
                <h3 className="text-3xl font-serif text-foreground mt-1">{appointments?.length || 0}</h3>
              </div>
            </div>
          </div>
          
          <div className="card-depth p-6 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 bg-surface-bright border border-border text-foreground rounded-2xl flex items-center justify-center">
              <Users size={24} className="stroke-[1.5px]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clientes</p>
              <h3 className="text-3xl font-serif text-foreground mt-1">{totalCustomers || 0}</h3>
            </div>
          </div>

          <div className="card-depth p-6 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 bg-surface-bright border border-border text-green-500 rounded-2xl flex items-center justify-center">
              <Activity size={24} className="stroke-[1.5px]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asistente IA</p>
              <h3 className="text-2xl font-serif text-foreground mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span> 
                {aiAvatar}
              </h3>
            </div>
          </div>
        </div>

        {/* Lista de Citas del Día */}
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-3">
            Agenda del Día
            <span className="text-sm font-sans font-medium bg-surface-bright border border-border px-3 py-1 rounded-full text-muted-foreground">
              {new Date().toLocaleDateString('es-MX')}
            </span>
          </h2>
          
          <div className="space-y-4 max-w-3xl">
            {appointments && appointments.length > 0 ? (
              appointments.map((apt) => {
                const start = formatTime(apt.start_time);
                const end = formatTime(apt.end_time);
                
                return (
                  <div key={apt.id} className="group card-depth rounded-3xl p-6 flex gap-6 items-stretch relative overflow-hidden transition-all hover:-translate-y-1">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gold-light to-gold-primary"></div>
                    
                    <div className="flex flex-col justify-center items-center pr-6 border-r border-border min-w-24">
                      <span className="text-2xl font-serif text-foreground">{start}</span>
                      <span className="text-xs font-bold text-muted-foreground mt-1 tracking-widest">{end}</span>
                    </div>
                    
                    <div className="flex-1 py-1 flex flex-col justify-center">
                      <h3 className="font-serif text-foreground text-xl leading-tight">{apt.title || 'Reserva Premium'}</h3>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <span className="text-sm font-medium text-foreground">{apt.customers?.name || 'Invitado Especial'}</span>
                      </div>
                      {apt.customers?.phone && (
                        <div className="inline-flex items-center gap-2 mt-4 bg-surface-bright px-3 py-1.5 rounded-full border border-border w-fit text-foreground text-xs font-medium tracking-wide">
                          {apt.customers.phone}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center text-center py-12 px-6 rounded-3xl border border-dashed border-border bg-surface/50 card-depth">
                <p className="font-serif text-xl text-foreground mb-2">Sin citas programadas</p>
                <p className="text-sm text-muted-foreground font-sans max-w-sm leading-relaxed">
                  Tu asistente de IA está listo para agendar citas.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
