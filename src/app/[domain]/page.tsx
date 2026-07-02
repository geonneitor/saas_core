import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Phone, User, Plus, Settings } from 'lucide-react';

import AiAssistantChat from '@/components/AiAssistantChat';
import { BookingModal } from '@/components/BookingModal';

export default async function TenantDashboard(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const domain = params.domain;
  const supabase = await createClient();

  // 1. Validar Inquilino
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, business_settings(*)')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) {
    notFound();
  }

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
  const aiAvatar = settings?.ai_avatar || 'lotito';

  // 2. Traer citas del día actual
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

  const todayStr = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans selection:bg-black selection:text-white">
      {/* Cabecera Premium */}
      <header className="bg-white sticky top-0 z-40 border-b border-neutral-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="px-4 py-4 max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 leading-tight">Calendario</h1>
            <p className="text-[13px] font-medium text-neutral-500 mt-0.5 capitalize">{tenant.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="mr-3 text-sm font-semibold text-neutral-500 hover:text-black flex items-center gap-1.5 transition-colors bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full">
              <Settings size={14} /> Admin
            </Link>
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-neutral-800">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Lista de Citas (Vista Diaria) */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt) => {
            const start = format(new Date(apt.start_time), 'HH:mm');
            const end = format(new Date(apt.end_time), 'HH:mm');
            
            return (
              <div key={apt.id} className="group bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex gap-5 items-stretch relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5">
                {/* Indicador de estado */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-black"></div>
                
                {/* Horario */}
                <div className="flex flex-col justify-center items-center pr-5 border-r border-black/5 min-w-20">
                  <span className="text-xl font-black text-black">{start}</span>
                  <span className="text-xs font-bold text-black/30 mt-1">{end}</span>
                </div>
                
                {/* Detalles de la cita */}
                <div className="flex-1 py-1">
                  <h3 className="font-bold text-black text-lg leading-tight">{apt.title || 'Cita Agendada'}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-black/60">
                    <User size={14} className="stroke-[3px]" />
                    <span className="text-sm font-semibold">{apt.customers?.name || 'Cliente sin registro'}</span>
                  </div>
                  {apt.customers?.phone && (
                    <div className="inline-flex items-center gap-1.5 mt-3 bg-black/5 px-2.5 py-1 rounded-md text-black font-semibold text-xs">
                      <Phone size={12} className="stroke-[3px]" />
                      {apt.customers.phone}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 px-4">
            <div className="bg-black/5 h-24 w-24 rounded-[2rem] rotate-3 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Calendar size={40} className="text-black/40 -rotate-3" />
            </div>
            <h3 className="text-xl font-black text-black mb-2 tracking-tight">Tu agenda está libre</h3>
            <p className="text-black/50 text-sm font-medium px-4">No tienes citas programadas para hoy. Es un buen momento para enviar promociones.</p>
          </div>
        )}
      </main>

      {/* Componente del Asistente IA */}
      <AiAssistantChat tenantId={tenant.id} tenantName={tenant.name} aiAvatar={aiAvatar as any} />
      
      {/* Modal Real de Citas */}
      <BookingModal tenantId={tenant.id} />
    </div>
  );
}
