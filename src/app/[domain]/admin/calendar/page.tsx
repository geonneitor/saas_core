import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

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
  
  // Generamos los días de la semana (Lunes a Domingo)
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  // Traer citas de esta semana
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, customers(name)')
    .eq('tenant_id', tenant.id)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('start_time', addDays(startOfCurrentWeek, 7).toISOString());

  // Horas de trabajo (ej. de 9am a 6pm)
  const hours = Array.from({ length: 10 }).map((_, i) => i + 9);

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
          <p className="text-neutral-500 capitalize">Semana del {format(startOfCurrentWeek, "d 'de' MMMM", { locale: es })}</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Cabecera del Calendario */}
        <div className="grid grid-cols-8 border-b border-neutral-200 bg-neutral-50">
          <div className="p-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-200">
            Hora
          </div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center border-r border-neutral-200 last:border-0">
              <span className={`text-xs font-bold uppercase ${isSameDay(day, today) ? 'text-blue-600' : 'text-neutral-500'}`}>
                {format(day, 'EEE', { locale: es })}
              </span>
              <div className={`mt-1 text-lg font-black ${isSameDay(day, today) ? 'text-blue-600' : 'text-neutral-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Grilla de Horas */}
        <div className="flex-1 overflow-y-auto min-h-125">
          <div className="grid grid-cols-8 relative">
            {hours.map(hour => (
              <div key={hour} className="contents">
                <div className="border-r border-b border-neutral-200 p-2 text-right text-xs font-medium text-neutral-400 h-20">
                  {hour}:00
                </div>
                {weekDays.map(day => {
                  // Filtramos citas para este día y esta hora específica (MVP básico)
                  const slotAppointments = appointments?.filter(appt => {
                    const d = new Date(appt.start_time);
                    return isSameDay(d, day) && d.getHours() === hour;
                  }) || [];

                  return (
                    <div key={`${day.toISOString()}-${hour}`} className="border-r border-b border-neutral-100 last:border-r-0 relative h-20 p-1">
                      {slotAppointments.map(appt => (
                        <div key={appt.id} className="absolute inset-1 bg-blue-100 border border-blue-200 rounded-lg p-2 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all z-10">
                          <p className="text-xs font-bold text-blue-700 truncate">{appt.customers?.name}</p>
                          <p className="text-[10px] font-medium text-blue-600/80 truncate">{appt.title}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
