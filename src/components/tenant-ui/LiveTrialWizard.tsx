'use client';

import { useState, useTransition, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateVisualSettings, updateAiSettings } from '@/app/[domain]/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings, Sparkles, Type, Palette, Image as ImageIcon, Check, ChevronDown, Wand2, X } from 'lucide-react';

const FONTS = [
  { id: 'serif', name: 'Elegante' },
  { id: 'sans', name: 'Moderno' },
  { id: 'mono', name: 'Digital' }
];

const COLORS = [
  { id: 'dark-luxury', name: 'Dark Luxury', bg: 'bg-[#111317]', text: 'text-white', hex: '#111317' },
  { id: 'light-minimal', name: 'Light Minimal', bg: 'bg-[#fafafa]', text: 'text-black', hex: '#fafafa' },
  { id: 'neon-cyber', name: 'Neon Cyber', bg: 'bg-black', text: 'text-[#00ff9d]', hex: '#000000' }
];

const IMAGES = [
  { id: 'color-only', url: 'default_hero.jpg', name: 'Solo Color' },
  { id: 'spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop', name: 'Spa' },
  { id: 'barber', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop', name: 'Barber' },
  { id: 'clinic', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop', name: 'Clínica' },
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop', name: 'Abstracto' }
];

const AVATARS = [
  { id: 'lotito', name: 'Clásico' },
  { id: 'orb', name: 'Mágico' },
  { id: 'cat', name: 'Mascota' },
  { id: 'robot', name: 'Robot' },
  { id: 'star', name: 'Premium' }
];

function LiveTrialWizardContent({ 
  tenantId, 
  currentSettings 
}: { 
  tenantId: string,
  currentSettings: { theme?: string, font?: string, hero_image?: string, brand_tagline?: string, ai_avatar?: string }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTheme, setActiveTheme] = useState(currentSettings.theme || 'dark-luxury');
  const [activeFont, setActiveFont] = useState(currentSettings.font || 'serif');
  const [activeImage, setActiveImage] = useState(currentSettings.hero_image || IMAGES[1].url);
  const [tagline, setTagline] = useState(currentSettings.brand_tagline || 'Excelencia y exclusividad en cada detalle.');
  const [activeAvatar, setActiveAvatar] = useState(currentSettings.ai_avatar || 'lotito');

  const saveVisualSettings = (key: string, value: string) => {
    startTransition(async () => {
      await updateVisualSettings(tenantId, { [key]: value });
      router.refresh();
    });
  };

  const saveAiAvatar = (avatarId: string) => {
    startTransition(async () => {
      await updateAiSettings(tenantId, { ai_avatar: avatarId });
      router.refresh();
    });
  };

  const handleTaglineBlur = () => {
    if (tagline !== currentSettings.brand_tagline) {
      saveVisualSettings('brand_tagline', tagline);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Wand2 className="w-5 h-5" />
        <span className="font-bold text-xs uppercase tracking-widest hidden md:block">Setup Rápido</span>
      </button>

      {/* Main Wizard Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-2xl border-t border-border/50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex-none p-4 border-b border-border flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-primary" />
                <h3 className="font-bold text-lg text-foreground">Asistente de Diseño</h3>
                {isPending && <span className="ml-2 text-[10px] uppercase bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse">Guardando...</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const isDemo = searchParams.get('demo_admin') === 'true';
                  router.push(isDemo ? '/console?demo_admin=true' : '/console');
                }} className="text-[10px] font-bold uppercase tracking-widest text-gold-primary hover:text-gold-light bg-gold-primary/10 hover:bg-gold-primary/20 px-3 py-1.5 rounded-full transition-colors">
                  Ir al Panel Avanzado
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 pb-12">
              
              {/* Texto Principal */}
              <section>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Type className="w-4 h-4" /> Mensaje de Bienvenida
                </label>
                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  onBlur={handleTaglineBlur}
                  className="w-full bg-surface-container border border-border rounded-xl p-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  rows={2}
                  placeholder="Ej: El mejor corte de la ciudad..."
                />
              </section>

              {/* Tipografía */}
              <section>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Type className="w-4 h-4" /> Estilo de Letra
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setActiveFont(f.id); saveVisualSettings('font', f.id); }}
                      className={`flex-none w-28 p-3 rounded-xl border text-center transition-all snap-center ${activeFont === f.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border hover:border-primary/50 bg-surface'}`}
                    >
                      <span className={`text-2xl block mb-1 ${f.id === 'serif' ? 'font-serif' : f.id === 'mono' ? 'font-mono' : 'font-sans'}`}>Ag</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{f.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Colores */}
              <section>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Palette className="w-4 h-4" /> Paleta de Colores
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveTheme(c.id); saveVisualSettings('theme', c.id); }}
                      className={`flex-none w-28 p-3 rounded-xl border transition-all snap-center flex flex-col items-center gap-2 ${activeTheme === c.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border hover:border-primary/50 bg-surface'}`}
                    >
                      <div className="w-8 h-8 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: c.hex }}></div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">{c.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Imagen de Fondo */}
              <section>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <ImageIcon className="w-4 h-4" /> Imagen de Fondo
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {IMAGES.map(img => (
                    <button
                      key={img.id}
                      onClick={() => { setActiveImage(img.url); saveVisualSettings('hero_image', img.url); }}
                      className={`flex-none w-32 aspect-video relative rounded-xl overflow-hidden border-2 transition-all snap-center ${activeImage === img.url ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'border-border hover:border-primary/50'}`}
                    >
                      {img.url === 'default_hero.jpg' ? (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <span className="text-[10px] font-bold text-muted-foreground">{img.name}</span>
                        </div>
                      ) : (
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      )}
                      {activeImage === img.url && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Avatar IA */}
              <section>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Wand2 className="w-4 h-4" /> Personaje IA
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => { setActiveAvatar(avatar.id); saveAiAvatar(avatar.id); }}
                      className={`flex-none w-28 p-3 rounded-xl border text-center transition-all snap-center flex flex-col items-center gap-2 ${activeAvatar === avatar.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border hover:border-primary/50 bg-surface'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface-bright border border-border`}>
                        <span className="text-[10px] font-bold text-muted-foreground">{avatar.name[0]}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">{avatar.name}</span>
                    </button>
                  ))}
                </div>
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function LiveTrialWizard(props: { 
  tenantId: string,
  currentSettings: { theme?: string, font?: string, hero_image?: string, brand_tagline?: string, ai_avatar?: string }
}) {
  return (
    <Suspense fallback={null}>
      <LiveTrialWizardContent {...props} />
    </Suspense>
  );
}
