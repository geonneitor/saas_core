'use client';

import Link from 'next/link';
import { OpenChatButton } from '@/components/OpenChatButton';

export function PublicHero() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="inline-flex items-center gap-2 border border-[#ff0055]/30 bg-[#ff0055]/10 text-[#ff0055] px-4 py-1.5 text-[9px] font-black tracking-[0.3em] uppercase mb-12 shadow-[0_0_15px_rgba(255,0,85,0.15)]">
        <div className="w-1.5 h-1.5 bg-[#ff0055] rounded-full animate-ping"></div>
        Estado Global: Online
      </div>
      
      <h1 className="text-center font-black text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] uppercase mb-8 max-w-6xl">
        Ingeniería <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600">Web</span><br />
        <span className="text-[#ff0055] font-serif italic font-light lowercase text-6xl md:text-8xl">de</span> Alto Calibre
      </h1>
      
      <p className="text-center text-neutral-400 text-sm md:text-lg max-w-2xl font-light tracking-wide leading-relaxed mb-12">
        Sistemas B2B con arquitectura Zero Trust y Asistentes de IA integrados que agendan citas 24/7. 
        Deja de usar plantillas genéricas. Escala con código puro.
      </p>

      <div className="flex flex-col sm:flex-row gap-8 items-center">
        <OpenChatButton />
        
        <Link href="#arquitectura" className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-[#ff0055] transition-all underline decoration-neutral-800 hover:decoration-[#ff0055] underline-offset-4">
          Ver Arquitectura
        </Link>
      </div>
    </div>
  )
}
