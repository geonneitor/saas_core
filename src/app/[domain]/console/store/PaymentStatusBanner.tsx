'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Displays a success or cancellation banner after Stripe Checkout redirect.
 * Reads `?success=true&module=X` or `?canceled=true` from the URL.
 * Auto-dismisses after 8 seconds.
 */
export function PaymentStatusBanner() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  const moduleName = searchParams.get('module');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (success || canceled) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled]);

  if (!visible) return null;

  return (
    <div
      className={`rounded-2xl border p-5 flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-500 ${
        success
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/10 border-red-500/30 text-red-300'
      }`}
    >
      {success ? (
        <CheckCircle className="w-6 h-6 shrink-0" />
      ) : (
        <XCircle className="w-6 h-6 shrink-0" />
      )}

      <div className="flex-1">
        <p className="font-bold text-sm">
          {success ? '¡Pago Exitoso!' : 'Pago Cancelado'}
        </p>
        <p className="text-xs opacity-70 mt-0.5">
          {success
            ? `El módulo "${moduleName || 'seleccionado'}" se está activando. Recarga la página en unos segundos para verlo.`
            : 'No se realizó ningún cargo. Puedes intentar de nuevo cuando quieras.'}
        </p>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
