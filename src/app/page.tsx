import Link from 'next/link';
import { Shield, Zap, Database, Terminal } from 'lucide-react';
import AiAssistantChat from '@/components/AiAssistantChat';
import { OpenChatButton } from '@/components/OpenChatButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-[#fafafa] font-sans selection:bg-[#ff0055] selection:text-white overflow-hidden relative">
      {/* Background CRT/Grid Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      
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
        <Link 
          href="/login" 
          className="text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-2 border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all"
        >
          Portal Admin
        </Link>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 py-12">
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

        {/* Feature Grid (Brutalist style) */}
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
      </main>

      <div className="fixed bottom-0 right-0 z-50 pointer-events-auto">
        <AiAssistantChat 
          tenantId="00000000-0000-0000-0000-000000000000" 
          tenantName="debugGeo" 
          aiAvatar="error404" 
          tagline="Resolviendo problemas complejos. La IA hace exactamente lo que necesitas. *Beep boop*"
        />
      </div>
    </div>
  );
}
