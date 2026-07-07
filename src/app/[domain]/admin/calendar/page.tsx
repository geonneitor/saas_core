import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { addDays, startOfWeek } from 'date-fns';
import InteractiveCalendar from '@/components/admin/InteractiveCalendar';

export default async function CalendarPage(props: { params: Promise<{ domain: string }> }) {
  const { domain } = await props.params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', domain)
    .single();

  if (!tenant) notFound();

  // Fecha base para la semana actual
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Lunes

  // Traer citas de esta semana y la próxima por defecto (para tener datos iniciales)
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, customers(name)')
    .eq('tenant_id', tenant.id)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('start_time', addDays(startOfCurrentWeek, 14).toISOString());

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <InteractiveCalendar initialAppointments={appointments || []} />
    </div>
  );
}
