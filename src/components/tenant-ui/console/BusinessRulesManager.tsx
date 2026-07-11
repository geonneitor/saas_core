'use client';

import { useState, useTransition } from 'react';
import { updateAiSettings } from '@/app/[domain]/actions';
import { Save, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BusinessRulesManager({ tenantId, currentRules }: { tenantId: string, currentRules?: string }) {
  const [rules, setRules] = useState(currentRules || '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const [saved, setSaved] = useState(false);

  const saveRules = () => {
    startTransition(async () => {
      await updateAiSettings(tenantId, { ai_rules: rules });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <p className="text-xs text-red-200/70 leading-relaxed">
          <strong>Advertencia:</strong> Lo que escribas aquí son órdenes absolutas. Si escribes "No hablar de precios", la IA se negará rotundamente a mencionar cualquier precio, incluso si el cliente insiste. Úsalo con cuidado.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Ej: Solo aceptamos pagos en efectivo. No hacemos devoluciones bajo ninguna circunstancia. Si alguien pregunta por Juan, di que está de vacaciones..."
          className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none font-mono leading-relaxed"
        />
        
        <div className="absolute bottom-4 right-4">
          <button
            onClick={saveRules}
            disabled={isPending || rules === currentRules}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              saved 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 disabled:opacity-50'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Guardado' : 'Guardar Reglas'}
          </button>
        </div>
      </div>
    </div>
  );
}
