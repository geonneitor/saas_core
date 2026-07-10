"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Sparkles, LayoutTemplate, MessageSquare, Briefcase, ChevronRight } from 'lucide-react';
import AiAssistantChat from '@/components/AiAssistantChat';
import { motion, AnimatePresence } from 'framer-motion';

type ThemeType = 'brutalist' | 'dark-luxury' | 'light-minimal';

export default function LandingPage() {
  const [activeTheme, setActiveTheme] = useState<ThemeType>('brutalist');

  const themes = {
    'brutalist': {
      bg: 'bg-[#0A0A0C]',
      text: 'text-white',
      accent: 'bg-white text-black',
      font: 'font-mono',
      headingFont: 'font-serif',
      card: 'border border-white/20 bg-transparent',
      name: 'Brutalista (Dev)'
    },
    'dark-luxury': {
      bg: 'bg-[#111317]',
      text: 'text-neutral-200',
      accent: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-black shadow-lg shadow-amber-500/20',
      font: 'font-sans',
      headingFont: 'font-serif',
      card: 'bg-[#1a1d24] border border-white/5 shadow-xl',
      name: 'Dark Luxury'
    },
    'light-minimal': {
      bg: 'bg-[#fafafa]',
      text: 'text-neutral-900',
      accent: 'bg-black text-white shadow-xl',
      font: 'font-sans',
      headingFont: 'font-sans',
      card: 'bg-white border border-neutral-200 shadow-sm',
      name: 'Minimal Light'
    }
  };

  const t = themes[activeTheme];

  return (
    <div className={`min-h-screen transition-colors duration-700 ${t.bg} ${t.text} ${t.font} selection:bg-amber-500/30 overflow-x-hidden relative flex flex-col justify-between`}>
      
      {/* Theme Switcher Banner */}
      <div className="fixed top-0 left-0 w-full z-50 p-2 sm:p-4 pointer-events-none">
        <div className="max-w-max mx-auto flex items-center gap-2 p-2 bg-neutral-900/80 backdrop-blur border border-white/10 rounded-full pointer-events-auto shadow-2xl">
          <span className="pl-3 pr-2 text-xs font-bold text-white/50 uppercase tracking-widest hidden sm:inline-block">Estilo:</span>
          {(Object.keys(themes) as ThemeType[]).map((themeKey) => (
            <button
              key={themeKey}
              onClick={() => setActiveTheme(themeKey)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                activeTheme === themeKey 
                  ? 'bg-white text-black scale-105' 
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {themes[themeKey].name}
            </button>
          ))}
        </div>
      </div>

      {/* Decorative Accents */}
      {activeTheme === 'brutalist' && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-white" />
          <div className="absolute top-20 left-8 text-[10px] font-mono tracking-widest uppercase opacity-50 hidden md:block">
            SYS. SAAS_CORE // B2B
          </div>
        </>
      )}

      {/* Navbar */}
      <nav className="w-full px-8 py-8 flex justify-between items-center max-w-7xl mx-auto mt-16 sm:mt-0">
        <div className="flex items-center gap-3">
          <Terminal className={`w-6 h-6 ${activeTheme === 'light-minimal' ? 'text-black' : 'text-white'}`} />
          <span className="font-bold text-xl tracking-tight">GEO-DEV</span>
        </div>
        <Link 
          href="/login" 
          className={`text-xs uppercase font-bold tracking-[0.2em] transition-colors ${
            activeTheme === 'light-minimal' ? 'text-neutral-500 hover:text-black' : 'text-neutral-500 hover:text-white'
          }`}
        >
          Acceso Clientes
        </Link>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTheme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mt-12 mb-20"
          >
            <h1 className={`${t.headingFont} text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] mb-8`}>
              {activeTheme === 'brutalist' ? (
                <>SISTEMAS<br/><span className="italic opacity-50">INTELIGENTES.</span></>
              ) : activeTheme === 'dark-luxury' ? (
                <>Presencia<br/><span className="italic text-amber-500">Premium.</span></>
              ) : (
                <>Menos estrés.<br/><span className="font-bold">Más ventas.</span></>
              )}
            </h1>
            
            <p className={`text-xl md:text-2xl max-w-2xl font-light tracking-tight leading-relaxed mb-12 ${activeTheme === 'light-minimal' ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Deja de perder clientes por no contestar a tiempo. Tu propio asistente de IA atiende, vende y agenda citas 24/7 en una plataforma de alto nivel.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                href="https://wa.me/521234567890" // Reemplazar con el WhatsApp real
                className={`inline-flex items-center justify-between px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 ${t.accent} rounded-sm`}
              >
                Solicitar mi Plataforma
                <ArrowRight className="w-4 h-4 ml-4" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className={`p-8 ${t.card} transition-colors duration-500`}>
            <MessageSquare className={`w-8 h-8 mb-6 ${activeTheme === 'dark-luxury' ? 'text-amber-500' : ''}`} />
            <h3 className="text-xl font-bold mb-3">IA Conversacional</h3>
            <p className="opacity-70 text-sm leading-relaxed">Un asistente inteligente que conoce tu negocio, responde dudas y cierra ventas por ti a cualquier hora.</p>
          </div>
          <div className={`p-8 ${t.card} transition-colors duration-500`}>
            <LayoutTemplate className={`w-8 h-8 mb-6 ${activeTheme === 'dark-luxury' ? 'text-amber-500' : ''}`} />
            <h3 className="text-xl font-bold mb-3">Diseño Camaleónico</h3>
            <p className="opacity-70 text-sm leading-relaxed">Tu imagen importa. Páginas web que se adaptan a la identidad de tu marca, desde lo minimalista hasta el lujo oscuro.</p>
          </div>
          <div className={`p-8 ${t.card} transition-colors duration-500`}>
            <Briefcase className={`w-8 h-8 mb-6 ${activeTheme === 'dark-luxury' ? 'text-amber-500' : ''}`} />
            <h3 className="text-xl font-bold mb-3">Gestión Total</h3>
            <p className="opacity-70 text-sm leading-relaxed">Panel administrativo para ver tus citas, ingresos y estadísticas en tiempo real. Cero fricción.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full px-8 py-8 flex flex-col sm:flex-row justify-between items-center border-t ${activeTheme === 'light-minimal' ? 'border-black/10' : 'border-white/10'}`}>
        <div className="flex items-center gap-3 opacity-50 mb-4 sm:mb-0">
          <span className="text-[10px] uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} Geo Dev SaaS
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-50">
          Infraestructura B2B
        </div>
      </footer>

      {/* Demo AI Assistant (Mock/Demo mode) */}
      <div className="fixed bottom-0 right-0 z-50 pointer-events-auto">
        <AiAssistantChat 
          tenantId="00000000-0000-0000-0000-000000000000" 
          tenantName="Geo Dev (Demo)" 
          aiAvatar="orb" 
          tagline="Prueba mi IA en vivo."
        />
      </div>
    </div>
  );
}
