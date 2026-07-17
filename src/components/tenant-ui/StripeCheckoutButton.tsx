'use client';

// [16726] Migrado desde src/components/admin/StripeCheckoutButton.tsx a tenant-ui. 
// Por qué: Cumplimiento de regla de arquitectura (Remoción de rutas legacy /admin).
// Cómo: Movimiento atómico de archivo y actualización de importaciones.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

interface StripeCheckoutButtonProps {
  moduleId: string;
  tenantId: string;
  text?: string;
  className?: string;
}

export default function StripeCheckoutButton({
  moduleId,
  tenantId,
  text = 'Pagar Ahora',
  className,
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, tenantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo iniciar el checkout.');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Stripe no devolvió una URL de pago.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al iniciar el pago.';
      console.error('[Checkout Error]', err);
      setError(message);
      setIsLoading(false);
    }
  };

  const base =
    'group inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed';

  const defaultStyles = className 
    ? className 
    : 'bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] shadow-gold-glow hover:shadow-[0_10px_40px_-5px_rgba(229,193,88,0.6)] hover:-translate-y-0.5';

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`${className ? className : `${base} ${defaultStyles}`}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Procesando…
          </>
        ) : (
          <>
            <CreditCard className="w-3.5 h-3.5" />
            {text}
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </>
        )}
      </button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80 pt-1">
        <ShieldCheck className="w-3 h-3" />
        Pago seguro cifrado por Stripe
      </p>
    </div>
  );
}
