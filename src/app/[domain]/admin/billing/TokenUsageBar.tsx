'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface TokenUsageBarProps {
  used: number;
  limit: number;
  planName?: string;
}

export default function TokenUsageBar({ used, limit, planName }: TokenUsageBarProps) {
  const safeLimit = limit > 0 ? limit : 1;
  const pct = Math.min(100, Math.max(0, (used / safeLimit) * 100));
  const remaining = Math.max(0, safeLimit - used);
  const isWarning = pct >= 80 && pct < 95;
  const isCritical = pct >= 95;

  const state = useMemo(() => {
    if (isCritical) return 'critical' as const;
    if (isWarning) return 'warning' as const;
    return 'ok' as const;
  }, [isCritical, isWarning]);

  const stateMeta = {
    ok: {
      bar: 'from-gold-light via-gold-primary to-gold-dark',
      glow: 'shadow-[0_0_24px_rgba(229,193,88,0.35)]',
      text: 'text-gold-primary',
      label: 'Consumo saludable',
      Icon: CheckCircle2,
    },
    warning: {
      bar: 'from-amber-300 via-amber-500 to-orange-600',
      glow: 'shadow-[0_0_24px_rgba(245,158,11,0.45)]',
      text: 'text-amber-400',
      label: 'Cerca del límite',
      Icon: AlertTriangle,
    },
    critical: {
      bar: 'from-red-400 via-red-500 to-red-700',
      glow: 'shadow-[0_0_28px_rgba(239,68,68,0.55)]',
      text: 'text-red-400',
      label: 'Límite alcanzado',
      Icon: AlertTriangle,
    },
  }[state];

  const StateIcon = stateMeta.Icon;

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold-primary" strokeWidth={2.5} />
            Consumo de Tokens IA
          </p>
          <h3 className="font-serif text-2xl md:text-3xl text-foreground tracking-tight mt-2">
            {used.toLocaleString('es-MX')} <span className="text-muted-foreground/60 text-lg">/ {safeLimit.toLocaleString('es-MX')}</span>
          </h3>
          {planName && (
            <p className="text-xs text-muted-foreground mt-1">
              Plan actual · <span className="text-foreground/80 font-semibold uppercase tracking-wider">{planName}</span>
            </p>
          )}
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/[0.02] ${stateMeta.text} border-current/30`}>
          <StateIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{stateMeta.label}</span>
        </div>
      </div>

      {/* Bar track */}
      <div className="relative">
        <div className="h-3 w-full rounded-full bg-white/[0.05] border border-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative h-full rounded-full bg-gradient-to-r ${stateMeta.bar} ${stateMeta.glow}`}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-shimmer" />
            </div>
          </motion.div>
        </div>

        {/* Tick marks (25/50/75) */}
        <div className="absolute inset-0 flex items-center justify-between px-[1px] pointer-events-none">
          {[25, 50, 75].map((tick) => (
            <div key={tick} className="w-px h-2 bg-white/15" />
          ))}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            <span className="text-foreground font-bold text-base">{Math.round(pct)}%</span> utilizado
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>
            {remaining.toLocaleString('es-MX')} restantes
          </span>
        </div>

        {(isWarning || isCritical) && (
          <motion.a
            href="/home"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-primary hover:text-gold-light transition-colors"
          >
            Ampliar mi plan →
          </motion.a>
        )}
      </div>
    </div>
  );
}
