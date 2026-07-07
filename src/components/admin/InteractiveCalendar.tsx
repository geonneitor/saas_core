'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, User, Sparkles } from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  customers: { name: string } | null;
  service_type?: string;
}

interface InteractiveCalendarProps {
  initialAppointments: Appointment[];
}

// Servicios simulados para dar color
const serviceColors: Record<string, string> = {
  'Corte': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  'Barba': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  'Tinte': 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  'default': 'bg-gold-primary/10 border-gold-primary/20 text-gold-primary',
};

export default function InteractiveCalendar({ initialAppointments }: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lunes
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const hours = Array.from({ length: 11 }).map((_, i) => i + 9); // 9am a 7pm

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getSlotAppointments = (day: Date, hour: number) => {
    return initialAppointments.filter(appt => {
      const d = new Date(appt.start_time);
      return isSameDay(d, day) && d.getHours() === hour;
    });
  };

  const handleSlotClick = (day: Date, hour: number) => {
    // Aquí abriríamos el modal para crear nueva cita
    console.log("Nueva cita el", day, "a las", hour);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header del Calendario */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif text-foreground tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-gold-primary" />
            Calendario
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">
            {format(startOfCurrentWeek, "MMMM yyyy", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleToday}
            className="px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-sm font-medium hover:bg-white/[0.05] transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center bg-white/[0.02] border border-white/[0.05] rounded-lg p-1">
            <button 
              onClick={handlePrevWeek}
              className="p-1.5 rounded hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium px-4 min-w-[140px] text-center capitalize">
              {format(startOfCurrentWeek, "dd MMM", { locale: es })} - {format(addDays(startOfCurrentWeek, 6), "dd MMM", { locale: es })}
            </span>
            <button 
              onClick={handleNextWeek}
              className="p-1.5 rounded hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button className="btn-premium-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2 ml-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Grilla Interactiva */}
      <div className="flex-1 card-depth rounded-3xl border border-white/[0.06] overflow-hidden flex flex-col">
        {/* Cabecera de Días */}
        <div className="grid grid-cols-8 border-b border-white/[0.06] bg-surface-dim/30">
          <div className="p-3 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-white/[0.06]">
            Hora
          </div>
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className="p-3 text-center border-r border-white/[0.06] last:border-0">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-gold-primary' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE', { locale: es })}
                </span>
                <div className={`mt-1 text-2xl font-serif ${isToday ? 'text-gold-light' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cuerpo de Horas (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="grid grid-cols-8 relative min-h-max">
            {hours.map(hour => (
              <div key={hour} className="contents">
                <div className="border-r border-b border-white/[0.06] p-2 pr-3 text-right text-xs font-medium text-muted-foreground h-24 flex flex-col justify-start">
                  <span className="-mt-2.5 bg-surface px-1">{hour}:00</span>
                </div>
                
                {weekDays.map(day => {
                  const slotAppointments = getSlotAppointments(day, hour);
                  
                  return (
                    <div 
                      key={`${day.toISOString()}-${hour}`} 
                      className="border-r border-b border-white/[0.03] last:border-r-0 relative h-24 p-1 group hover:bg-white/[0.01] transition-colors cursor-pointer"
                      onClick={() => handleSlotClick(day, hour)}
                    >
                      {/* Plus icon on hover for empty slots */}
                      {slotAppointments.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Citas */}
                      {slotAppointments.map(appt => {
                        const serviceType = appt.service_type || 'default';
                        const colorClass = serviceColors[serviceType] || serviceColors['default'];
                        
                        return (
                          <motion.div 
                            layoutId={`appt-${appt.id}`}
                            key={appt.id} 
                            onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); setIsModalOpen(true); }}
                            className={`absolute inset-1 rounded-xl p-2.5 border overflow-hidden shadow-sm hover:shadow-md transition-all z-10 flex flex-col gap-1 ${colorClass} hover:brightness-125`}
                          >
                            <p className="text-xs font-bold truncate leading-tight">{appt.customers?.name || 'Cliente'}</p>
                            <p className="text-[10px] font-medium opacity-80 truncate">{appt.title}</p>
                            
                            {/* AI generated indicator */}
                            <div className="absolute bottom-1 right-1 opacity-50">
                              <Sparkles className="w-3 h-3" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Cita */}
      <AnimatePresence>
        {isModalOpen && selectedAppointment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              layoutId={`appt-${selectedAppointment.id}`}
              className="bg-surface border border-white/[0.06] rounded-3xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary">
                  <User className="w-5 h-5" />
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-white/5 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-serif text-foreground mb-1">{selectedAppointment.customers?.name || 'Cliente sin nombre'}</h2>
              <p className="text-muted-foreground text-sm mb-6">{selectedAppointment.title}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-foreground/80 bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                  <Clock className="w-4 h-4 text-gold-primary" />
                  {format(new Date(selectedAppointment.start_time), "EEEE d 'de' MMMM, h:mm a", { locale: es })}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-white/[0.05] text-foreground text-xs font-bold uppercase tracking-widest hover:bg-white/[0.1] transition-colors">
                  Reprogramar
                </button>
                <button className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
