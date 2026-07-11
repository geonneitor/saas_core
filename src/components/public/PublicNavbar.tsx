'use client';

import Link from 'next/link';

export function PublicNavbar() {
  return (
    <header className="relative z-20 px-8 py-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
      <div className="text-2xl font-black tracking-tighter uppercase text-white flex items-center gap-2">
        GEO<span className="text-[#ff0055]">DEV</span>
        <div className="w-2 h-2 bg-[#ff0055] animate-pulse rounded-none"></div>
      </div>
      <nav className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        <span className="hover:text-white transition-colors cursor-pointer">Sistemas</span>
        <span className="hover:text-white transition-colors cursor-pointer">Seguridad</span>
        <span className="hover:text-white transition-colors cursor-pointer">Métricas</span>
      </nav>
    </header>
  )
}
