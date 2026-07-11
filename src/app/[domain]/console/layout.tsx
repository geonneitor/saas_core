import { ReactNode } from 'react';
import Link from 'next/link';
import { Settings, Calendar, BrainCircuit, Activity, ChevronLeft, ShoppingBag } from 'lucide-react';

export default async function PartnerConsoleLayout({ children, params }: { children: ReactNode, params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col md:flex-row selection:bg-gold-primary/30 selection:text-gold-light relative overflow-hidden">
      {/* Noise Texture & Glow */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary/[0.02] rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 backdrop-blur-md p-6 flex flex-col relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gold-primary uppercase tracking-[0.3em] font-bold">Partner</span>
            <span className="font-serif text-xl tracking-tight">Console.</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/console" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/70 hover:text-white">
            <Activity className="w-4 h-4" /> Dashboard (ROI)
          </Link>
          <Link href="/console/ai-training" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-primary/10 border border-gold-primary/20 text-gold-light text-sm font-bold">
            <BrainCircuit className="w-4 h-4" /> AI Control Center
          </Link>
          <Link href="/console/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/70 hover:text-white">
            <Calendar className="w-4 h-4" /> Calendario
          </Link>
          <Link href="/console/store" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/70 hover:text-white group">
            <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> Marketplace</span>
            <span className="text-[9px] bg-gold-primary/20 text-gold-light px-2 py-0.5 rounded-full uppercase tracking-widest font-bold group-hover:bg-gold-primary group-hover:text-black transition-colors">Nuevo</span>
          </Link
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver a mi Web
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 relative z-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
