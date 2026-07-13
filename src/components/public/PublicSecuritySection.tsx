'use client';

import { Lock, KeyRound, FileSearch } from 'lucide-react';

export function PublicSecuritySection() {
  return (
    <div id="seguridad" className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-32 border border-white/10 bg-white/10 p-[1px] w-full max-w-5xl">
      <div className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors border-l-2 border-transparent hover:border-[#ff0055]">
        <Lock className="w-6 h-6 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Row Level Security</h3>
        <p className="text-neutral-500 text-[11px] leading-relaxed">Cada query pasa por políticas RLS a nivel Postgres. Imposible leer datos de otro tenant.</p>
      </div>
      <div className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors border-l-2 border-transparent hover:border-[#ff0055]">
        <KeyRound className="w-6 h-6 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-2">JWT + Session Cookies</h3>
        <p className="text-neutral-500 text-[11px] leading-relaxed">Tokens firmados con secret rotativo. Cookies httpOnly, sameSite strict, dominio compartido para subdominios.</p>
      </div>
      <div className="bg-[#050508] p-8 flex flex-col items-start hover:bg-[#0a0a0f] transition-colors border-l-2 border-transparent hover:border-[#ff0055]">
        <FileSearch className="w-6 h-6 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Audit Log</h3>
        <p className="text-neutral-500 text-[11px] leading-relaxed">Cada acción destructiva queda registrada: actor, timestamp, payload. Solo super_admin puede leer.</p>
      </div>
    </div>
  )
}
