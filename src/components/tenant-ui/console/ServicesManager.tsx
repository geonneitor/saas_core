'use client';

import { useState, useTransition } from 'react';
import { updateAiSettings } from '@/app/[domain]/actions';
import { Plus, Trash2, Clock, DollarSign, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // en minutos
}

export function ServicesManager({ tenantId, initialServices = [] }: { tenantId: string, initialServices?: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const saveToDB = (newServices: Service[]) => {
    startTransition(async () => {
      await updateAiSettings(tenantId, { services_json: newServices });
      router.refresh();
    });
  };

  const addService = () => {
    if (!newName.trim() || !newPrice || !newDuration) return;
    
    const newService: Service = {
      id: Math.random().toString(36).substring(7),
      name: newName,
      price: parseFloat(newPrice),
      duration: parseInt(newDuration, 10)
    };

    const updated = [...services, newService];
    setServices(updated);
    saveToDB(updated);

    setNewName('');
    setNewPrice('');
    setNewDuration('');
  };

  const removeService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    saveToDB(updated);
  };

  return (
    <div className="space-y-6">
      {/* Formulario rápido */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block"><Tag className="w-3 h-3 inline mr-1" />Nombre del Servicio</label>
          <input 
            type="text" 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold-primary transition-colors outline-none"
            placeholder="Ej: Corte de Cabello VIP"
          />
        </div>
        <div className="w-32">
          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block"><DollarSign className="w-3 h-3 inline mr-1" />Precio</label>
          <input 
            type="number" 
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold-primary transition-colors outline-none"
            placeholder="0.00"
          />
        </div>
        <div className="w-32">
          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block"><Clock className="w-3 h-3 inline mr-1" />Minutos</label>
          <input 
            type="number" 
            value={newDuration}
            onChange={e => setNewDuration(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold-primary transition-colors outline-none"
            placeholder="60"
          />
        </div>
        <button 
          onClick={addService}
          disabled={isPending || !newName.trim() || !newPrice || !newDuration}
          className="btn-premium-gold h-[38px] px-6 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tabla de Servicios */}
      {services.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-white/10 rounded-2xl">
          Aún no has agregado ningún servicio.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative group hover:bg-white/[0.05] transition-colors">
              <h4 className="font-bold text-white mb-2 pr-8 truncate">{s.name}</h4>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${s.price.toFixed(2)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration} min</span>
              </div>
              <button 
                onClick={() => removeService(s.id)}
                className="absolute top-4 right-4 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
