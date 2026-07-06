"use client";

import { Sparkles } from 'lucide-react';

export function OpenChatButton() {
  return (
    <button 
      onClick={() => {
        // Busca el botón del chat por sus características para simular un clic y abrirlo
        const chatButton = document.querySelector('button[title="Dictado por voz"]')?.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('button');
        if (chatButton) {
           (chatButton as HTMLButtonElement).click();
        } else {
           // Fallback en caso de que la estructura cambie
           const widgetBtn = document.querySelector('.fixed.bottom-6.right-6 button');
           if (widgetBtn) (widgetBtn as HTMLButtonElement).click();
        }
      }}
      className="group relative inline-flex items-center justify-center px-8 py-4 font-sans font-semibold tracking-widest text-on-primary uppercase text-sm bg-gradient-to-r from-gold-light to-gold-primary rounded-full overflow-hidden transition-all hover:scale-105 shadow-gold-glow"
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
      <span className="relative flex items-center gap-3">
        <Sparkles className="w-4 h-4" />
        Agendar con IA
      </span>
    </button>
  );
}
