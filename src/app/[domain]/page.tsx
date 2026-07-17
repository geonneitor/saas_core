import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import AiAssistantChat from '@/components/AiAssistantChat';
import { AvatarSelector } from '@/components/AvatarSelector';
import { LiveTrialWizard } from '@/components/tenant-ui/LiveTrialWizard';

import { DarkLuxuryTheme } from '@/components/tenant-ui/themes/DarkLuxuryTheme';
import { CozyStudioTheme } from '@/components/tenant-ui/themes/CozyStudioTheme';
import { CleanPreviewTheme } from '@/components/tenant-ui/themes/CleanPreviewTheme';

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

  const themeProps = {
    tenant: { id: tenant.id, name: tenant.name },
    settings: { theme, font, hero_image: heroImage, brand_tagline: tagline, ai_avatar: aiAvatar as string, whatsapp_number: settings?.whatsapp_number },
    isAdmin,
    domain
  };

  return (
    <>
      {isAdmin && (
        <LiveTrialWizard 
          tenantId={tenant.id} 
          currentSettings={{ theme, font, hero_image: heroImage, brand_tagline: tagline, ai_avatar: aiAvatar as string }} 
        />
      )}

      {/* Global Navbar (Only for Admin tools and Avatar) */}
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-4">
          {isAdmin && (
            <Link href={process.env.NODE_ENV === 'development' ? "/console?demo_admin=true" : "/console"} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors">
              Ir a Consola
            </Link>
          )}
          <AvatarSelector tenantId={tenant.id} currentAvatar={aiAvatar as string} isAdmin={false} />
      </div>

      {theme === 'cozy-studio' ? (
        <CozyStudioTheme {...themeProps} />
      ) : theme === 'clean-preview' ? (
        <CleanPreviewTheme {...themeProps} />
      ) : (
        <DarkLuxuryTheme {...themeProps} />
      )}

      {/* Global Contact & AI Widgets */}
      {settings?.whatsapp_number && (
        <a 
          href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}`} 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 left-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Contactar por WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        </a>
      )}

      {systemStatus !== 'downgraded' && (
        <div className="z-[100] relative">
          <AiAssistantChat 
            tenantId={tenant.id} 
            tenantName={tenant.name} 
            aiAvatar={aiAvatar as any} 
            tagline={tagline}
            isAdmin={isAdmin} 
          />
        </div>
      )}
    </>
  );
}
