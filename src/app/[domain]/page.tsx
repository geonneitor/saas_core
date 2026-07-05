import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, Phone, User, Plus, Settings, Sparkles } from 'lucide-react';

import AiAssistantChat from '@/components/AiAssistantChat';
import { BookingModal } from '@/components/BookingModal';
import { AvatarSelector } from '@/components/AvatarSelector';
import { AvatarSystem } from '@/components/avatars/AvatarSystem';

export default async function TenantLandingPage(props: { params: Promise<{ domain: string }> }) {
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
  const isAdmin = !!(user && tenant.owner_id === user.id);

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
  const aiAvatar = settings?.ai_avatar || 'lotito';
  const tagline = settings?.brand_tagline || 'Excelencia y exclusividad en cada detalle.';
  
  // Extract features to show in the landing
  const features = [
    { title: "Servicio Premium", desc: "Atención personalizada enfocada en tus necesidades." },
    { title: "Tecnología de Punta", desc: "Reservas impulsadas por inteligencia artificial." },
    { title: "Exclusividad", desc: "Un ambiente diseñado para tu máximo confort." }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-on-primary overflow-x-hidden">
      
      {/* Navbar Minimalista */}
      <nav className="absolute top-0 w-full px-6 py-6 z-40 flex justify-between items-center max-w-6xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-primary flex items-center justify-center shadow-gold-glow-sm">
            <span className="font-serif font-bold text-on-primary text-lg">{tenant.name.charAt(0)}</span>
          </div>
          <span className="font-sans font-bold tracking-widest uppercase text-xs text-foreground">{tenant.name}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <AvatarSelector tenantId={tenant.id} currentAvatar={aiAvatar as string} isAdmin={isAdmin} />
          {isAdmin && (
            <Link href={`http://${domain}.localhost:3000/admin`} className="btn-premium-gold px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
              Ir al Panel
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 pt-20">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-surface-bright/20 rounded-full blur-[90px] -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold-primary font-bold font-sans">
            Bienvenido a la Experiencia
          </p>
          <h1 className="font-serif text-6xl md:text-8xl text-foreground tracking-tight leading-[1.1] drop-shadow-sm">
            {tenant.name}.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-sans max-w-2xl mx-auto font-light leading-relaxed">
            {tagline}
          </p>
          
          <div className="pt-8">
            <button 
              onClick={() => document.querySelector('button[title="Dictado por voz"]')?.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('button')?.click()}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-sans font-semibold tracking-widest text-on-primary uppercase text-sm bg-gradient-to-r from-gold-light to-gold-primary rounded-full overflow-hidden transition-all hover:scale-105 shadow-gold-glow"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                Agendar con IA
              </span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Descubrir</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold-primary to-transparent"></div>
        </div>
      </header>

      {/* Hairline Decorativo */}
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4" aria-hidden>
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold-primary/20 to-gold-primary/20" />
          <div className="w-2 h-2 rotate-45 border border-gold-primary/50"></div>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold-primary/20 to-gold-primary/20" />
        </div>
      </div>

      {/* Secciones de Características (Template) */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">Nuestro Estándar</h2>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Lo que nos hace diferentes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="card-depth p-10 rounded-3xl group hover:-translate-y-2 transition-transform duration-500">
              <div className="w-12 h-12 rounded-full bg-surface-bright border border-border flex items-center justify-center mb-6 shadow-gold-glow-sm">
                <span className="font-serif text-gold-primary text-xl">{i + 1}</span>
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground font-sans leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-foreground text-xl">{tenant.name}</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} {tenant.name}. Reservas gestionadas por Inteligencia Artificial.
          </p>
        </div>
      </footer>

      {/* Componente del Asistente IA (El verdadero motor de conversión) */}
      <AiAssistantChat tenantId={tenant.id} tenantName={tenant.name} aiAvatar={aiAvatar as any} isAdmin={isAdmin} />
      
      {/* Modal Real de Citas */}
      <BookingModal tenantId={tenant.id} />
    </div>
  );
}
