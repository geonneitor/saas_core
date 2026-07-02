"use client";

import { useBookingStore } from '@/store/useBookingStore';
import { useState } from 'react';

import { X, Calendar as CalendarIcon, Clock, User, AlignLeft } from 'lucide-react';
import { bookAppointment } from '@/app/[domain]/actions';

export function BookingModal({ tenantId }: { tenantId: string }) {
  const { isModalOpen, prefilledData, closeModal } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const clientName = (form.elements.namedItem('clientName') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const time = (form.elements.namedItem('time') as HTMLInputElement).value;
    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value;

    const result = await bookAppointment(tenantId, { clientName, date, time, notes });
    
    setIsSubmitting(false);
    
    if (result.success) {
      alert('¡Cita agendada correctamente!');
      closeModal();
    } else {
      alert(`Error al agendar: ${result.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 leading-tight">Confirmar Cita</h2>
            <p className="text-[13px] font-medium text-neutral-500 mt-0.5">La IA preparó estos datos para ti</p>
          </div>
          <button onClick={closeModal} className="p-2 bg-white text-neutral-400 hover:text-neutral-900 rounded-full border border-neutral-200 hover:bg-neutral-100 transition-all">
            <X size={18} className="stroke-[2.5px]" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cliente */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wide">
              <User size={14} className="text-neutral-400" />
              Cliente
            </label>
            <input 
              type="text" 
              name="clientName"
              defaultValue={prefilledData?.clientName || ''}
              className="w-full p-3.5 bg-[#F9FAFB] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400"
              placeholder="Nombre del cliente"
              required
            />
          </div>

          {/* Fecha y Hora en Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wide">
                <CalendarIcon size={14} className="text-neutral-400" />
                Fecha
              </label>
              <input 
                type="date" 
                name="date"
                className="w-full p-3.5 bg-[#F9FAFB] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-[15px] font-medium text-neutral-900"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock size={14} className="text-neutral-400" />
                Hora
              </label>
              <input 
                type="time" 
                name="time"
                defaultValue={prefilledData?.suggestedTime || ''}
                className="w-full p-3.5 bg-[#F9FAFB] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-[15px] font-medium text-neutral-900"
                required
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wide">
              <AlignLeft size={14} className="text-neutral-400" />
              Notas de la IA
            </label>
            <textarea 
              name="notes"
              defaultValue={prefilledData?.notes || ''}
              className="w-full p-3.5 bg-[#F9FAFB] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-[15px] font-medium text-neutral-900 resize-none h-24 placeholder:text-neutral-400"
              placeholder="Detalles adicionales del servicio..."
            ></textarea>
          </div>

          {/* Botones */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-[15px] hover:bg-neutral-800 hover:shadow-lg transition-all disabled:opacity-70 disabled:hover:shadow-none flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                'Agendar Oficialmente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
