import { PremiumHero } from '@/components/tenant-ui/PremiumHero';
import { DynamicManifesto } from '@/components/tenant-ui/DynamicManifesto';
import { ThemeProps } from './types';

export function DarkLuxuryTheme({ tenant, settings }: ThemeProps) {
  const tagline = settings?.brand_tagline || 'Excelencia y exclusividad en cada detalle.';
  const theme = settings?.theme || 'dark-luxury';
  const font = settings?.font || 'serif';
  let heroImage = settings?.hero_image || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop';
  if (heroImage === 'default_hero.jpg' || !heroImage.startsWith('http')) {
    heroImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop';
  }

  const features = [
    { title: "Exclusividad Absoluta", desc: "Atención hiper-personalizada. Tu tiempo y preferencias son nuestra máxima prioridad." },
    { title: "Reserva Inteligente", desc: "Nuestro Concierge IA gestiona tu espacio en segundos, 24/7, sin fricciones." },
    { title: "Experiencia Elevada", desc: "Un estándar de servicio diseñado para superar expectativas en cada detalle." }
  ];

  return (
    <div className={`client-theme min-h-screen ${theme === 'light-minimal' ? 'bg-[#fafafa]' : ''} overflow-x-hidden`} style={theme !== 'light-minimal' ? { backgroundColor: 'var(--zen-bg)' } : undefined}>
      {/* Navbar Minimalista (Original) */}
      <nav className="absolute top-0 w-full px-6 py-6 z-40 flex justify-between items-center max-w-6xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-primary flex items-center justify-center shadow-gold-glow-sm">
            <span className="font-serif font-bold text-on-primary text-lg">{tenant.name.charAt(0)}</span>
          </div>
          <span className={`font-sans font-bold tracking-widest uppercase text-xs ${theme === 'light-minimal' ? 'text-black' : 'text-white'}`}>{tenant.name}</span>
        </div>
      </nav>

      <PremiumHero 
        name={tenant.name} 
        tagline={tagline} 
        heroImage={heroImage}
        theme={theme}
        font={font}
      />

      <DynamicManifesto theme={theme} font={font} />

      <section className={`py-20 px-6 max-w-6xl mx-auto ${theme === 'light-minimal' ? 'text-black' : 'text-white'}`}>
        <div className="text-center mb-16 space-y-4">
          <h2 className={`${font === 'serif' ? 'font-serif' : 'font-sans'} text-4xl md:text-5xl`}>Nuestro Estándar</h2>
          <p className="text-muted-foreground text-sm uppercase tracking-widest opacity-70">Lo que nos hace diferentes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className={`card-depth p-10 rounded-3xl group hover:-translate-y-2 transition-transform duration-500 border ${theme === 'light-minimal' ? 'bg-white border-black/10 shadow-sm' : 'bg-[#1a1d24] border-white/5'}`}>
              <div className="w-12 h-12 rounded-full bg-surface-bright border border-border flex items-center justify-center mb-6 shadow-gold-glow-sm">
                <span className={`${font === 'serif' ? 'font-serif' : 'font-sans'} text-gold-primary text-xl`}>{i + 1}</span>
              </div>
              <h3 className={`${font === 'serif' ? 'font-serif' : 'font-sans'} text-2xl mb-3`}>{feature.title}</h3>
              <p className="opacity-70 font-sans leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Original */}
      <footer className={`border-t ${theme === 'light-minimal' ? 'border-black/10 bg-[#f0f0f0]' : 'border-white/10 bg-[#0a0b0d]'} mt-20`}>
        <div className={`max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 ${theme === 'light-minimal' ? 'text-black' : 'text-white'}`}>
          <div className="flex items-center gap-3">
            <span className={`${font === 'serif' ? 'font-serif' : 'font-sans'} font-bold text-xl`}>{tenant.name}</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xs uppercase tracking-widest opacity-50">
              © {new Date().getFullYear()} {tenant.name}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
