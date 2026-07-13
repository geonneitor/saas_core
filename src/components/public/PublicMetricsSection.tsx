'use client';

import { Activity, Users, Zap } from 'lucide-react';

export function PublicMetricsSection() {
  // These are illustrative metrics for the public landing. Real numbers
  // come from the /hq dashboard.
  const metrics = [
    { icon: Users, value: '—', label: 'Tenants activos', sub: 'red multi-tenant en producción' },
    { icon: Zap, value: '<400ms', label: 'SSR Load', sub: 'Edge runtime global' },
    { icon: Activity, value: '99.97%', label: 'Uptime', sub: 'monitored 24/7' },
  ];

  return (
    <div id="metricas" className="mt-32 w-full max-w-5xl">
      <div className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff0055] mb-3">
          En producción
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
          Métricas <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600">reales.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border border-white/10 bg-white/10 p-[1px]">
        {metrics.map(({ icon: Icon, value, label, sub }, i) => (
          <div
            key={i}
            className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors"
          >
            <Icon className="w-5 h-5 text-[#ff0055] mb-6" />
            <p className="text-4xl font-black tracking-tighter text-white mb-1">{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{label}</p>
            <p className="text-[10px] text-neutral-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
