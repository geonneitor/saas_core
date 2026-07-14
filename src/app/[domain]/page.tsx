import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import AiAssistantChat from '@/components/AiAssistantChat';
import { AvatarSelector } from '@/components/AvatarSelector';

import { PremiumHero } from '@/components/tenant-ui/PremiumHero';
import { DynamicManifesto } from '@/components/tenant-ui/DynamicManifesto';
import { LiveTrialWizard } from '@/components/tenant-ui/LiveTrialWizard';

import type { Metadata } from 'next';

const getTenantData = unstable_cache(
  async (domain: string) => {
    const supabaseAnon = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    return supabaseAnon
      .from('tenants')
      .select('id, name, subdomain, is_active, owner_id, business_settings(id, tenant_id, theme, font, hero_image, brand_tagline, ai_avatar, system_status, whatsapp_number, opening_time, closing_time, services_json)')
      .eq('subdomain', domain)
      .single();
  },
  ['tenant-data'],
  { revalidate: 60, tags: ['tenants'] }
);

export async function generateMetadata(
  props: { params: Promise<{ domain: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const domain = params.domain;

  const { data: tenant, error } = await getTenantData(domain);

  if (error || !tenant) {
    console.error("[METADATA] Tenant fetch error for domain", domain, error);
    return { title: 'Página no encontrada' };
  }

  const settings = Array.isArray(tenant.business_settings) ? tenant.business_settings[0] : tenant.business_settings;
  const tagline = settings?.brand_tagline || 'Experiencia y exclusividad.';

  return {
    title: `${tenant.name} | Portal de Reservas`,
    description: tagline,
  };
}

export default async function TenantLandingPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const domain = params.domain;
  const supabase = await createClient();

  // 1. Validar Inquilino con caché agresiva para proteger base de datos
  const { data: tenant, error } = await getTenantData(domain);

  if (!tenant || !tenant.is_active) {
    console.error(`[TENANT PAGE] Tenant not found or inactive for domain: "${domain}". Error:`, error);
    notFound();
  }
  
  const searchParams = await props.searchParams;
  const isCustomDomain = searchParams.custom_domain === 'true';

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = !!(user && tenant.owner_id === user.id);
  
  if (user && !isAdmin) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role === 'super_admin') {
      isAdmin = true;
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    isAdmin = true;
  }
  
  console.log('[TENANT LANDING] User ID:', user?.id, '| Role check isAdmin:', isAdmin, '| Tenant Owner:', tenant.owner_id);

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
    
  const systemStatus = settings?.system_status || 'trial';
  
  if (systemStatus === 'downgraded' && isCustomDomain && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#111317] flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-3xl font-serif text-gold-primary mb-4">Dominio Inactivo</h1>
        <p className="text-muted-foreground max-w-md">El dominio personalizado de este negocio se encuentra temporalmente suspendido.</p>
      </div>
    );
  }
    
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
    { title: "Exclusividad Absoluta", desc: "Atención hiper-personalizada. Tu tiempo y preferencias son nuestra máxima prioridad." },
    { title: "Reserva Inteligente", desc: "Nuestro Concierge IA gestiona tu espacio en segundos, 24/7, sin fricciones." },
    { title: "Experiencia Elevada", desc: "Un estándar de servicio diseñado para superar expectativas en cada detalle." }
  ];

  return (
    <div className={`client-theme min-h-screen ${theme === 'light-minimal' ? 'bg-[#fafafa]' : ''} overflow-x-hidden`} style={theme !== 'light-minimal' ? { backgroundColor: 'var(--zen-bg)' } : undefined}>
      {isAdmin && (
        <LiveTrialWizard 
          tenantId={tenant.id} 
          currentSettings={{ theme, font, hero_image: heroImage, brand_tagline: tagline, ai_avatar: aiAvatar as string }} 
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
          {isAdmin && (
            <Link href={process.env.NODE_ENV === 'development' ? "/console?demo_admin=true" : "/console"} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-gold-primary/30 text-gold-primary hover:bg-gold-primary/10 transition-colors">
              Ir a Consola
            </Link>
          )}
          <AvatarSelector tenantId={tenant.id} currentAvatar={aiAvatar as string} isAdmin={false} />
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
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xs uppercase tracking-widest opacity-50">
              © {new Date().getFullYear()} {tenant.name}.
            </p>
            <a 
              href={process.env.NODE_ENV === 'development' ? 'http://app.localhost:3000' : `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-gold-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Powered by AI
            </a>
          </div>
        </div>
      </footer>

      {settings?.whatsapp_number && (
        <a 
          href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}`} 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Contactar por WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        </a>
      )}

      {systemStatus !== 'downgraded' && (
        <AiAssistantChat 
          tenantId={tenant.id} 
          tenantName={tenant.name} 
          aiAvatar={aiAvatar as any} 
          tagline={tagline}
          isAdmin={isAdmin} 
        />
      )}
    </div>
  );
}
