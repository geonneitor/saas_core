'use client';

import { Shield, Zap, Database } from 'lucide-react';

export function PublicFeatureGrid() {
  return (
    <div id="arquitectura" className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-32 border border-white/10 bg-white/10 p-[1px] w-full max-w-5xl">
      <div className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors border-l-2 border-transparent hover:border-[#ff0055]">
        <Zap className="w-6 h-6 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-2">0.4s SSR Load</h3>
        <p className="text-neutral-500 text-[11px] leading-relaxed">Carga inicial ultrarrápida usando Next.js App Router y Edge runtime.</p>
      </div>
      <div className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors border-l-2 border-transparent hover:border-[#ff0055]">
        <Shield className="w-6 h-6 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Zero Trust</h3>
        <p className="text-neutral-500 text-[11px] leading-relaxed">Autenticación estricta con Supabase RLS. Datos encriptados end-to-end.</p>
      </div>
      <div className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors border-l-2 border-transparent hover:border-[#ff0055]">
        <Database className="w-6 h-6 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Multi-Tenant</h3>
        <p className="text-neutral-500 text-[11px] leading-relaxed">Base de datos compartida pero lógicamente separada por inquilino empresarial.</p>
      </div>
    </div>
  )
}
