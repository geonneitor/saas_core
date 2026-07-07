'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Check, ChevronRight, Image as ImageIcon, Type, Palette, RefreshCw } from 'lucide-react';
import { updateVisualSettings } from '@/app/[domain]/actions';
import { useRouter } from 'next/navigation';

const THEMES = [
  { id: 'dark-luxury', name: 'Dark Luxury', bg: 'bg-[#111317]', text: 'text-white' },
  { id: 'light-minimal', name: 'Light Minimal', bg: 'bg-[#fafafa]', text: 'text-black' },
  { id: 'neon-cyber', name: 'Neon Cyber', bg: 'bg-black', text: 'text-[#00ff9d]' }
];

const FONTS = [
  { id: 'serif', name: 'Elegant Serif' },
  { id: 'sans', name: 'Modern Sans' },
  { id: 'mono', name: 'Tech Mono' }
];

const IMAGES = [
  { id: 'spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop', name: 'Spa & Wellness' },
  { id: 'barber', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop', name: 'Barbershop' },
  { id: 'clinic', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop', name: 'Modern Clinic' },
  { id: 'fitness', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop', name: 'Fitness Studio' },
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', name: 'Abstract Liquid' }
];

export function StyleSelector({ 
  tenantId, 
  currentSettings 
}: { 
  tenantId: string,
  currentSettings: { theme?: string, font?: string, hero_image?: string }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [activeTheme, setActiveTheme] = useState(currentSettings.theme || 'dark-luxury');
  const [activeFont, setActiveFont] = useState(currentSettings.font || 'serif');
  const [activeImage, setActiveImage] = useState(currentSettings.hero_image || IMAGES[0].url);

  const saveSettings = (key: string, value: string) => {
    startTransition(async () => {
      await updateVisualSettings(tenantId, { [key]: value });
      router.refresh();
    });
  };

  return (
    <div className="fixed top-1/4 right-0 z-50 flex items-start">
      {/* Botón para abrir */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-3 rounded-l-xl shadow-2xl hover:bg-primary/90 transition-colors flex flex-col items-center gap-2 border border-r-0 border-primary/20"
      >
        {isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
        <span className="text-[10px] font-bold uppercase [writing-mode:vertical-rl] rotate-180 tracking-widest">
          Estilos
        </span>
      </button>

      {/* Panel de Opciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl h-auto max-h-[80vh] overflow-y-auto rounded-bl-2xl overflow-hidden"
          >
            <div className="p-6 space-y-8 w-[320px]">
              <div>
                <h3 className="font-bold text-lg mb-1">Apariencia en Vivo</h3>
                <p className="text-xs text-muted-foreground mb-4">Los cambios se aplican al instante.</p>
              </div>

              {/* Selector de Tema */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Palette className="w-4 h-4" /> Temas
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTheme(t.id); saveSettings('theme', t.id); }}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${activeTheme === t.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border border-border ${t.bg}`}></div>
                        <span className="text-sm font-medium">{t.name}</span>
                      </div>
                      {activeTheme === t.id && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Fuentes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Type className="w-4 h-4" /> Tipografía
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setActiveFont(f.id); saveSettings('font', f.id); }}
                      className={`p-3 rounded-lg border text-center transition-all ${activeFont === f.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                      <span className={`text-xl block mb-1 ${f.id === 'serif' ? 'font-serif' : f.id === 'mono' ? 'font-mono' : 'font-sans'}`}>Aa</span>
                      <span className="text-[10px] uppercase">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Imagen Genérica */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <ImageIcon className="w-4 h-4" /> Fondo Principal
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGES.map(img => (
                    <button
                      key={img.id}
                      onClick={() => { setActiveImage(img.url); saveSettings('hero_image', img.url); }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'border-transparent hover:border-primary/50'}`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider text-center">{img.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
