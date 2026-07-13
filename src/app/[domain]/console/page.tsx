import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

export default async function PartnerDashboardPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDemo = process.env.NODE_ENV === 'development';

  if (!user && !isDemo) {
    // Redirigir al login del sistema principal (app.localhost)
    redirect(process.env.NODE_ENV === 'development' ? 'http://app.localhost:3000/login' : `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`);
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('ai_tokens_used, ai_token_limit')
    .eq('subdomain', params.domain)
    .single();

  const tokensUsed = tenant?.ai_tokens_used || 0;
  const tokenLimit = tenant?.ai_token_limit || 100000;
  const tokenPercentage = Math.min(100, Math.round((tokensUsed / tokenLimit) * 100));
  const isNearLimit = tokenPercentage >= 90;
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-serif">Bienvenido al <span className="text-gold-primary italic">Futuro.</span></h1>
        <p className="text-muted-foreground max-w-xl text-sm">Tu asistente IA está listo para aprender. Configúralo para empezar a automatizar tus ventas y reservas.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder ROI Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 card-depth">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Citas Agendadas por IA</p>
          <p className="text-4xl font-serif">0</p>
          <p className="text-xs text-emerald-400 mt-2">+0% esta semana</p>
        </div>

        {/* Placeholder ROI Card 2 (Token Usage) */}
        <div className={`bg-white/[0.02] border rounded-2xl p-6 card-depth relative overflow-hidden ${isNearLimit ? 'border-red-500/50' : 'border-white/5'}`}>
          {isNearLimit && (
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
          )}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Interacciones IA Usadas
          </p>
          <div className="flex items-end gap-2 mb-2">
            <p className={`text-4xl font-serif ${isNearLimit ? 'text-red-400' : 'text-white'}`}>{tokensUsed.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mb-1">/ {tokenLimit.toLocaleString()}</p>
          </div>
          
          <div className="w-full bg-black/40 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isNearLimit ? 'bg-red-500' : 'bg-gold-primary'}`}
              style={{ width: `${tokenPercentage}%` }}
            />
          </div>
          
          {isNearLimit ? (
            <p className="text-xs text-red-400 mt-3 font-medium">⚠️ Estás a punto de alcanzar tu límite.</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-3">Plan Estándar (Activo)</p>
          )}
        </div>
      </div>

      <div className="bg-gold-primary/[0.05] border border-gold-primary/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-gold-primary/20 flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-8 h-8 text-gold-light" />
        </div>
        <h2 className="text-2xl font-serif mb-4">Entrena a tu Empleado IA</h2>
        <p className="text-muted-foreground text-sm mb-8">Para que el asistente pueda atender a tus clientes, primero debes enseñarle tus precios, servicios y reglas de negocio.</p>
        <Link href="/console/ai-training" className="btn-premium-gold px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          Ir al AI Control Center
        </Link>
      </div>
    </div>
  );
}
