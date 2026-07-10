"use client";

import { Terminal } from 'lucide-react';

export function OpenChatButton() {
  return (
    <button 
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-ai-chat'));
      }}
      className="group relative inline-flex items-center justify-center px-10 py-5 font-sans font-bold tracking-[0.2em] uppercase text-xs bg-white text-black rounded-none border border-white hover:bg-transparent hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)] active:translate-y-1 active:translate-x-1 active:shadow-none"
    >
      <span className="relative flex items-center gap-3">
        <Terminal className="w-4 h-4 group-hover:animate-pulse" />
        Iniciar Secuencia de IA
      </span>
    </button>
  );
}
