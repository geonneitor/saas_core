import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import AiAssistantChat from '@/components/AiAssistantChat';
import { BookingModal } from '@/components/BookingModal';
import { AvatarSelector } from '@/components/AvatarSelector';

import { PremiumHero } from '@/components/tenant-ui/PremiumHero';
import { DynamicManifesto } from '@/components/tenant-ui/DynamicManifesto';
import { StyleSelector } from '@/components/tenant-ui/StyleSelector';

export default async function TenantLandingPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const domain = params.domain;
  const supabase = await createClient();

  // 1. Validar Inquilino
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*, business_settings(*)')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) {
    console.error(`[TENANT PAGE] Tenant not found or inactive for domain: "${domain}". Error:`, error);
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = !!(user && tenant.owner_id === user.id);
  
  if (user && !isAdmin) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role === 'super_admin') {
      isAdmin = true;
    }
  }
  const searchParams = await props.searchParams;
  if (process.env.NODE_ENV === 'development' && searchParams.demo_admin === 'true') {
    isAdmin = true;
  }
  
  console.log('[TENANT LANDING] User ID:', user?.id, '| Role check isAdmin:', isAdmin, '| Tenant Owner:', tenant.owner_id);

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
    
  const aiAvatar = settings?.ai_avatar || 'lotito';
  const tagline = settings?.brand_tagline || 'Excelencia y exclusividad en cada detalle.';
  const theme = settings?.theme || 'dark-luxury';
  const font = settings?.font || 'serif';
  let heroImage = settings?.hero_image || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop';
  if (heroImage === 'default_hero.jpg' || !heroImage.startsWith('http')) {
    heroImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop';
  }
  
  // Extract features to show in the landing
  const features = [
    { title: "Servicio Premium", desc: "Atención personalizada enfocada en tus necesidades." },
    { title: "Tecnología de Punta", desc: "Reservas impulsadas por inteligencia artificial." },
    { title: "Exclusividad", desc: "Un ambiente diseñado para tu máximo confort." }
  ];

  return (
    <div className={`min-h-screen ${theme === 'light-minimal' ? 'bg-[#fafafa]' : 'bg-[#111317]'} selection:bg-primary selection:text-on-primary overflow-x-hidden`}>
      {isAdmin && (
        <StyleSelector 
          tenantId={tenant.id} 
          currentSettings={{ theme, font, hero_image: heroImage }} 
        />
      )}

      {/* Navbar Minimalista */}
      <nav className="absolute top-0 w-full px-6 py-6 z-40 flex justify-between items-center max-w-6xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-primary flex items-center justify-center shadow-gold-glow-sm">
            <span className="font-serif font-bold text-on-primary text-lg">{tenant.name.charAt(0)}</span>
          </div>
          <span className={`font-sans font-bold tracking-widest uppercase text-xs ${theme === 'light-minimal' ? 'text-black' : 'text-white'}`}>{tenant.name}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <AvatarSelector tenantId={tenant.id} currentAvatar={aiAvatar as string} isAdmin={isAdmin} />
          {isAdmin && (
            <Link href="/admin" className="btn-premium-gold px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
              Ir al Panel
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Dinámico */}
      <PremiumHero 
        name={tenant.name} 
        tagline={tagline} 
        heroImage={heroImage}
        theme={theme}
        font={font}
      />

      {/* Manifesto Dinámico */}
      <DynamicManifesto theme={theme} font={font} />

      {/* Secciones de Características */}
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

      {/* Footer */}
      <footer className={`border-t ${theme === 'light-minimal' ? 'border-black/10 bg-[#f0f0f0]' : 'border-white/10 bg-[#0a0b0d]'} mt-20`}>
        <div className={`max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 ${theme === 'light-minimal' ? 'text-black' : 'text-white'}`}>
          <div className="flex items-center gap-3">
            <span className={`${font === 'serif' ? 'font-serif' : 'font-sans'} font-bold text-xl`}>{tenant.name}</span>
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50">
            © {new Date().getFullYear()} {tenant.name}. Reservas gestionadas por Inteligencia Artificial.
          </p>
        </div>
      </footer>

      <AiAssistantChat 
        tenantId={tenant.id} 
        tenantName={tenant.name} 
        aiAvatar={aiAvatar as any} 
        tagline={tagline}
        isAdmin={isAdmin} 
      />
      
      <BookingModal tenantId={tenant.id} />
    </div>
  );
}
