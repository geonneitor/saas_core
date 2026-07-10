import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';
import AiAssistantChat from '@/components/AiAssistantChat';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-foreground font-sans selection:bg-white/20 overflow-hidden relative flex flex-col justify-between">
      {/* Brutalist Accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-white" />
      <div className="absolute top-8 left-8 text-[10px] font-mono tracking-widest uppercase opacity-50">
        SYS. SAAS_CORE // GEO-DEV B2B
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl mt-20">
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] mb-8 text-white mix-blend-difference">
            SISTEMAS<br />
            <span className="italic text-white/50">INTELIGENTES.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl font-light tracking-tight leading-relaxed mb-12">
            Deja de perder clientes por no contestar a tiempo. Tu propio Asistente de IA atiende, vende y agenda citas 24/7. Una infraestructura Zero Trust diseñada para negocios que quieren escalar.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link 
              href="https://wa.me/message/xyz" // O el contacto del vendedor
              className="inline-flex items-center justify-between px-8 py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors"
            >
              Solicitar mi Plataforma
              <ArrowRight className="w-4 h-4 ml-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer & Login Link */}
      <footer className="w-full px-8 py-8 flex flex-col sm:flex-row justify-between items-center border-t border-white/10 mt-20">
        <div className="flex items-center gap-3 opacity-50 mb-4 sm:mb-0">
          <Terminal className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest">
            Infraestructura Privada B2B
          </span>
        </div>

        <Link 
          href="/login" 
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
        >
          Acceso Administrador
        </Link>
      </footer>

      {/* Demo AI Assistant */}
      <div className="fixed bottom-0 right-0 z-50 pointer-events-auto">
        <AiAssistantChat 
          tenantId="00000000-0000-0000-0000-000000000000" 
          tenantName="Geo Dev (Demo)" 
          aiAvatar="orb" 
          tagline="Prueba mi IA en vivo. ¿En qué te ayudo?"
        />
      </div>
    </div>
  );
}
