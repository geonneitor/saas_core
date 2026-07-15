import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar as CalendarIcon } from 'lucide-react';

export default async function PartnerCalendarPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV !== 'development') {
    redirect('http://app.localhost:3000/login');
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', params.domain)
    .single();

  if (!tenant) return <div>Inquilino no encontrado</div>;

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, customers(name, email)')
    .eq('tenant_id', tenant.id)
    .order('start_time', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-gold-primary" />
          </div>
          <h1 className="text-3xl font-serif">Calendario de Citas</h1>
        </div>
        <p className="text-muted-foreground text-sm">Gestiona tus reservas y visualiza las citas agendadas por la Inteligencia Artificial.</p>
      </header>

      <div className="zen-card p-8">
        {(!appointments || appointments.length === 0) ? (
          <div className="text-center py-20 text-white/40">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay citas programadas aún.</p>
            <p className="text-sm mt-2">Cuando tu IA agende una cita, aparecerá aquí automáticamente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => {
              const start = new Date(apt.start_time);
              const isPast = start < new Date();
              return (
                <div key={apt.id} className={`flex items-center justify-between p-4 rounded-2xl border ${isPast ? 'bg-black/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10'}`}>
                  <div>
                    <h3 className="font-bold text-lg text-gold-light">{apt.customers?.name || 'Cliente'}</h3>
                    <p className="text-sm text-white/60">{apt.title}</p>
                    {apt.notes && <p className="text-xs text-white/40 mt-1 italic">"{apt.notes}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{start.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <p className="text-2xl font-serif">{start.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                    <span className="text-[10px] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full mt-2 inline-block">
                      {apt.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
