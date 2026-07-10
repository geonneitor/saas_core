import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CreditCard, Sparkles, CheckCircle2, ShieldAlert, ArrowUpRight, Crown, AlertCircle } from 'lucide-react';
import WalletDashboard from '@/components/admin/WalletDashboard';
import StripeCheckoutButton from './StripeCheckoutButton';

export default async function BillingPage(props: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ session_id?: string; success?: string }>;
}) {
  const { domain } = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // 1. Cargar tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, subdomain, is_active, setup_fee_paid, setup_advance_paid, trial_ends_at, stripe_customer_id, created_at')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) notFound();

  // 2. Cargar consumo real de tokens
  const { data: settings } = await supabase
    .from('business_settings')
    .select('ai_tokens_used, ai_tokens_limit')
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  const tokensUsed = settings?.ai_tokens_used ?? 0;
  const tokensLimit = settings?.ai_tokens_limit ?? 500;

  const showSuccess = Boolean(searchParams.session_id || searchParams.success);
  
  const now = new Date();
  const trialEnds = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
  const daysInTrial = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const isTrialActive = daysInTrial > 0;
  const isFullyPaid = tenant.setup_fee_paid;
  const isAdvancePaid = tenant.setup_advance_paid;
  const needsPayment = !isFullyPaid;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-foreground font-sans selection:bg-gold-primary/30 selection:text-gold-light">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gold-primary/[0.05] rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gold-primary/[0.03] rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-12">
        {/* --- Header --- */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">
            <CreditCard className="w-3.5 h-3.5" strokeWidth={2.5} />
            Facturación · {tenant.name}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
            Gestión Patrimonial y <span className="italic text-gold-primary">Tokens IA.</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Control total de tu inversión. Eres dueño del sistema principal, sin rentas mensuales forzosas. Solo recargas el consumo de la Inteligencia Artificial cuando lo necesitas.
          </p>

          {showSuccess && (
            <div className="mt-2 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">¡Pago recibido exitosamente!</p>
                <p className="text-emerald-200/80 text-xs mt-0.5">
                  Tu billetera y accesos han sido actualizados de inmediato.
                </p>
              </div>
            </div>
          )}
        </header>

        {/* --- Adquisición Patrimonial (Setup Fee) --- */}
        {needsPayment && (
          <div className="relative overflow-hidden card-depth border border-gold-primary/30 rounded-3xl p-6 md:p-10 bg-gradient-to-br from-surface via-[#1a1510] to-[#0A0A0C] shadow-gold-glow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-light via-gold-primary to-gold-dark animate-shimmer" />
            
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <AlertCircle className="w-3 h-3" />
                  {isTrialActive 
                    ? `Día ${7 - daysInTrial + 1} de 7 - Prueba Gratuita` 
                    : 'Prueba Finalizada'}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                  Adquiere el Núcleo del Sistema.
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  El sistema básico de reservas y calendario es tuyo para siempre. Un solo pago, sin suscripciones mensuales. {isTrialActive && 'Al terminar tus 7 días de prueba, la Inteligencia Artificial se pausará hasta completar la adquisición.'}
                </p>
                
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2 text-sm text-foreground/80"><CheckCircle2 className="w-4 h-4 text-gold-primary" /> Sistema de Reservas 24/7</li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80"><CheckCircle2 className="w-4 h-4 text-gold-primary" /> Panel de Administración Completo</li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80"><CheckCircle2 className="w-4 h-4 text-gold-primary" /> Sin mensualidades (Solo pagas uso de IA)</li>
                </ul>
              </div>

              <div className="space-y-4">
                {/* Opción 1: Adelanto Promo */}
                {!isAdvancePaid && isTrialActive && (
                  <div className="p-5 rounded-2xl border-2 border-gold-primary/50 bg-gold-primary/5 relative hover:bg-gold-primary/10 transition-colors">
                    <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] text-[9px] font-black uppercase tracking-widest">
                      Promo Liquidación
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">Adelanto (30%)</h3>
                        <p className="text-xs text-muted-foreground">Asegura tu sistema durante la prueba</p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-2xl text-foreground">$600</span>
                        <span className="text-xs text-muted-foreground"> MXN</span>
                      </div>
                    </div>
                    <p className="text-xs text-gold-primary font-medium flex items-center gap-1 mb-4">
                      <Sparkles className="w-3 h-3" /> ¡Gana 50% EXTRA de tokens en tu 1ra recarga!
                    </p>
                    <StripeCheckoutButton 
                      priceId="price_setup_advance" 
                      tenantId={tenant.id} 
                      className="w-full btn-premium-gold px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs"
                      text="Pagar Adelanto ($600 MXN)"
                    />
                  </div>
                )}

                {/* Opción 2: Pago Completo */}
                <div className={`p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${!isAdvancePaid && isTrialActive ? 'opacity-90' : 'border-gold-primary/50'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">
                        {isAdvancePaid ? 'Liquidar Restante' : 'Pago Completo'}
                      </h3>
                      <p className="text-xs text-muted-foreground">Único pago de por vida</p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-2xl text-foreground">
                        {isAdvancePaid ? '$1,399' : '$1,999'}
                      </span>
                      <span className="text-xs text-muted-foreground"> MXN</span>
                    </div>
                  </div>
                  <StripeCheckoutButton 
                    priceId={isAdvancePaid ? "price_setup_balance" : "price_setup_full"} 
                    tenantId={tenant.id} 
                    className={`w-full px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs ${isAdvancePaid || !isTrialActive ? 'btn-premium-gold' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    text="Liquidar Núcleo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Dashboard de Tokens (Solo visible si ya es dueño o está en trial) --- */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WalletDashboard 
              tokensUsed={tokensUsed} 
              tokensLimit={tokensLimit} 
              tenantId={tenant.id}
              hasPromo={isAdvancePaid && !isFullyPaid} // Has promo active if advance paid
            />
          </div>

          {/* ── Columna derecha: Módulos Adicionales ── */}
          <div className="space-y-6">
            <div className="card-depth rounded-3xl p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">Add-ons</p>
              <h3 className="font-serif text-2xl text-foreground tracking-tight mt-1.5">Módulos Extra</h3>
              <p className="text-xs text-muted-foreground mt-2 mb-6">
                Potencia tu sistema base con compras de un solo pago.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-gold-primary/30 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Asistente en WhatsApp</h4>
                      <p className="text-xs text-muted-foreground mt-1">Conecta la IA directamente a tu línea comercial.</p>
                    </div>
                    <span className="text-xs font-serif text-foreground bg-white/10 px-2 py-1 rounded">$1,500</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-gold-primary/30 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Captación Activa</h4>
                      <p className="text-xs text-muted-foreground mt-1">La IA envía mensajes de seguimiento automático a clientes inactivos.</p>
                    </div>
                    <span className="text-xs font-serif text-foreground bg-white/10 px-2 py-1 rounded">$900</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
