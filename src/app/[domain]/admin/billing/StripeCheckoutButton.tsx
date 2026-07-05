'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

interface StripeCheckoutButtonProps {
  plan: 'starter' | 'premium' | 'elite';
  cycle: 'monthly' | 'yearly';
  label?: string;
  variant?: 'primary' | 'secondary';
}

export default function StripeCheckoutButton({
  plan,
  cycle,
  label = 'Mejorar mi plan',
  variant = 'primary',
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
        body: JSON.stringify({ plan, cycle, returnUrl: window.location.href }),
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

  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] shadow-gold-glow hover:shadow-[0_10px_40px_-5px_rgba(229,193,88,0.6)] hover:-translate-y-0.5'
      : 'bg-white/5 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20';

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`${base} ${styles}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Conectando con Stripe…
          </>
        ) : (
          <>
            <CreditCard className="w-3.5 h-3.5" />
            {label}
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
