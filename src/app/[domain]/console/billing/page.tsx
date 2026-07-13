import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CreditCard, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import WalletDashboard from '@/components/admin/WalletDashboard';
import StripeCheckoutButton from '../../admin/billing/StripeCheckoutButton';

export default async function ConsoleBillingPage(props: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ session_id?: string; success?: string }>;
}) {
  const { domain } = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, subdomain, is_active, setup_fee_paid, setup_advance_paid, trial_ends_at, stripe_customer_id, created_at')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) notFound();

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
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      <header className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gold-primary" />
          </div>
          <h1 className="text-3xl font-serif">Adquisición y Billetera</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Eres dueño del sistema principal. No hay rentas mensuales forzosas; gestiona aquí la propiedad de tu software y el saldo de Inteligencia Artificial.
        </p>

        {showSuccess && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">¡Transacción procesada con éxito!</p>
              <p className="text-emerald-400/70 text-xs mt-1">
                Tu billetera y accesos han sido actualizados en la base de datos de manera inmediata.
              </p>
            </div>
          </div>
        )}
      </header>

      {needsPayment && (
        <section className="relative overflow-hidden card-depth border border-gold-primary/30 rounded-3xl p-8 md:p-10 bg-gradient-to-br from-[#121212] to-black shadow-gold-glow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-light via-gold-primary to-gold-dark animate-shimmer" />
          
          <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <AlertCircle className="w-3 h-3" />
                {isTrialActive 
                  ? `Día ${7 - daysInTrial + 1} de 7 - Prueba Gratuita` 
                  : 'Prueba Finalizada - IA Pausada'}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl">
                Liquida el Núcleo del Sistema.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Adquiere la propiedad de este software (calendario, CRM, panel). Paga una sola vez, sin ataduras mensuales. {isTrialActive && 'Al concluir la prueba, las funciones automatizadas se pausarán hasta completar el pago.'}
              </p>
              
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-gold-primary" /> Landing Page y CRM 24/7</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-gold-primary" /> Command Center Premium</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-gold-primary" /> Acceso a Billetera Prepago de IA</li>
              </ul>
            </div>

            <div className="space-y-4">
              {!isAdvancePaid && isTrialActive && (
                <div className="p-6 rounded-2xl border-2 border-gold-primary/40 bg-gold-primary/5 relative hover:bg-gold-primary/10 transition-colors">
                  <div className="absolute -top-3 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
                    Recomendado
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">Anticipo (30%)</h3>
                      <p className="text-xs text-muted-foreground mt-1">Asegura la promo durante tu prueba</p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-3xl text-gold-light">$600</span>
                      <span className="text-xs text-muted-foreground ml-1">MXN</span>
                    </div>
                  </div>
                  <p className="text-xs text-gold-primary font-medium flex items-center gap-1.5 mb-5 mt-2">
                    <Sparkles className="w-3.5 h-3.5" /> Incluye 50% extra de Tokens en 1ra recarga
                  </p>
                  <StripeCheckoutButton 
                    priceId="price_setup_advance" 
                    tenantId={tenant.id} 
                    className="w-full btn-premium-gold px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-gold-primary/20"
                    text="Pagar Adelanto ($600 MXN)"
                  />
                </div>
              )}

              <div className={`p-6 rounded-2xl border bg-black/40 transition-colors ${!isAdvancePaid && isTrialActive ? 'border-white/10 hover:bg-white/[0.02]' : 'border-gold-primary/40 bg-gold-primary/5'}`}>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-lg">
                      {isAdvancePaid ? 'Liquidar Restante' : 'Pago de Contado'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Dueño absoluto de por vida</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-3xl">
                      {isAdvancePaid ? '$1,399' : '$1,999'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">MXN</span>
                  </div>
                </div>
                <StripeCheckoutButton 
                  priceId={isAdvancePaid ? "price_setup_balance" : "price_setup_full"} 
                  tenantId={tenant.id} 
                  className={`w-full px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs ${isAdvancePaid || !isTrialActive ? 'btn-premium-gold shadow-lg shadow-gold-primary/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  text="Liquidar Software"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <WalletDashboard 
          tokensUsed={tokensUsed} 
          tokensLimit={tokensLimit} 
          tenantId={tenant.id}
          hasPromo={isAdvancePaid && !isFullyPaid}
        />
      </section>

    </div>
  );
}
