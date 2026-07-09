import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-foreground font-sans selection:bg-white/20 overflow-hidden relative flex flex-col justify-between">
      {/* Brutalist Accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-white" />
      <div className="absolute top-8 left-8 text-[10px] font-mono tracking-widest uppercase opacity-50">
        SYS. SAAS_CORE // V.4.5.1
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl mt-20">
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] mb-8 text-white mix-blend-difference">
            SISTEMAS<br />
            <span className="italic text-white/50">INTELIGENTES.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl font-light tracking-tight leading-relaxed mb-12">
            Automatiza tu agenda, fideliza clientes y escala tus operaciones con nuestra infraestructura Zero Trust para negocios de alto nivel.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link 
              href="https://wa.me/message/xyz" // O el contacto del vendedor
              className="inline-flex items-center justify-between px-8 py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors"
            >
              Contactar Agente
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
            Infraestructura Privada
          </span>
        </div>

        <Link 
          href="/login" 
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
        >
          Acceso Administrador
        </Link>
      </footer>
    </div>
  );
}
