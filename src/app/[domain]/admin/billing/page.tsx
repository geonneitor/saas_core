import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Sparkles, Calendar, Receipt, ArrowUpRight, Crown, AlertCircle } from 'lucide-react';
import TokenUsageBar from './TokenUsageBar';
import StripeCheckoutButton from './StripeCheckoutButton';

type PlanKey = 'basica' | 'pro' | 'max';

const RECARGAS_CATALOG: Record<PlanKey, { name: string; price: number; tokens: number; tagline: string }> = {
  basica: { name: 'Recarga Básica', price: 150, tokens: 1000, tagline: 'Ideal para semanas tranquilas. ~200 citas gestionadas.' },
  pro: { name: 'Recarga Pro', price: 400, tokens: 3000, tagline: 'El equilibrio perfecto. Nunca te quedes sin saldo en meses.' },
  max: { name: 'Recarga Max', price: 900, tokens: 10000, tagline: 'Para negocios con alto volumen. Despreocúpate por completo.' },
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default async function BillingPage(props: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ plan?: string; cycle?: string; session_id?: string }>;
}) {
  const { domain } = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // 1. Cargar tenant con suscripción
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, subdomain, is_active, subscription_plan, subscription_status, stripe_customer_id, current_period_end, created_at')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) notFound();

  // 2. Cargar consumo real de tokens
  const { data: settings } = await supabase
    .from('business_settings')
    .select('ai_tokens_used, ai_tokens_limit, brand_tagline')
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  const tokensUsed = settings?.ai_tokens_used ?? 0;
  const tokensLimit = settings?.ai_tokens_limit ?? 500;

  // 3. Derivar estado
  const isActive = tenant.subscription_status === 'active';
  const showSuccess = Boolean(searchParams.session_id);

  // 4. UI: día de renovación
  const renewDate = tenant.current_period_end ? new Date(tenant.current_period_end) : null;
  // `now` se calcula una sola vez por request (server component).
  const now = new Date();
  const daysToRenewal = renewDate
    ? Math.max(0, Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-foreground font-sans selection:bg-gold-primary/30 selection:text-gold-light">
      {/* Ambient glows */}
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
            Tu Billetera de <span className="italic text-gold-primary">Inteligencia Artificial.</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Control total de tu inversión. Recarga solo lo que consumes, sin rentas mensuales forzosas ni sorpresas bancarias.
          </p>

          {showSuccess && (
            <div className="mt-2 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">¡Pago recibido!</p>
                <p className="text-emerald-200/80 text-xs mt-0.5">
                  Tu suscripción se está activando. El contador de tokens se ha reiniciado y los nuevos límites
                  estarán disponibles en unos segundos.
                </p>
              </div>
            </div>
          )}
        </header>

        {/* --- Promo Banner --- */}
        <div className="relative overflow-hidden card-depth border border-gold-primary/30 rounded-3xl p-6 md:p-8 bg-gradient-to-r from-gold-primary/10 via-surface to-surface flex flex-col md:flex-row items-center justify-between gap-6 shadow-gold-glow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-light via-gold-primary to-gold-dark animate-shimmer" />
          <div className="flex-1 space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              <AlertCircle className="w-3 h-3" />
              Demo Gratuita de 7 Días Activa
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground">
              Asegura tu asistente digital hoy.
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              Paga tu instalación única de <span className="text-foreground font-bold line-through opacity-50">$3,500</span> <span className="text-gold-primary font-bold">$1,900 MXN</span> hoy y recibe un <span className="text-foreground font-bold underline decoration-gold-primary decoration-2">50% de descuento</span> en tu primera recarga de tokens. Sin cobros automáticos, sin sorpresas.
            </p>
          </div>
          <button 
            type="button" 
            className="shrink-0 relative z-10 btn-premium-gold px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(229,193,88,0.4)] hover:scale-105 transition-transform"
          >
            Generar Ficha de Pago
          </button>
        </div>

        {/* --- Grid principal --- */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Columna izquierda (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta de Tokens (el highlight) */}
            <div className="relative card-depth rounded-3xl p-8 md:p-10 overflow-hidden">
              {/* Decoración */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary">
                      <Sparkles className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
                        Modelo Amigo
                      </p>
                      <p className="font-serif text-lg text-foreground mt-0.5">
                        Tu saldo nunca expira
                      </p>
                    </div>
                  </div>

                  {daysToRenewal !== null && daysToRenewal <= 7 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <AlertCircle className="w-3 h-3" />
                      Renueva en {daysToRenewal} días
                    </div>
                  )}
                </div>

                <TokenUsageBar used={tokensUsed} limit={tokensLimit} />
              </div>
            </div>

            {/* Tabla de comparación de planes (3 columnas) */}
            <div className="card-depth rounded-3xl p-8 md:p-10">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">Recargar Saldo</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-tight mt-1.5">
                    Recarga tu billetera vía SPEI.
                  </h2>
                </div>
                <Link
                  href="/home"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-gold-primary transition-colors flex items-center gap-1"
                >
                  Ver comparativa completa
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(RECARGAS_CATALOG) as PlanKey[]).map((key) => {
                  const p = RECARGAS_CATALOG[key];
                  return (
                    <div
                      key={key}
                      className="relative rounded-2xl p-6 flex flex-col transition-all bg-white/[0.02] border border-white/[0.06] hover:border-gold-primary/40 hover:shadow-gold-glow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {key === 'max' ? (
                          <Crown className="w-4 h-4 text-gold-primary" strokeWidth={2} />
                        ) : key === 'pro' ? (
                          <Sparkles className="w-4 h-4 text-gold-primary" strokeWidth={2} />
                        ) : (
                          <CreditCard className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                        )}
                        <h3 className="font-serif text-xl text-foreground">{p.name}</h3>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem]">{p.tagline}</p>

                      <div className="mt-4 mb-6 flex items-end gap-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">$</span>
                        <span className="font-serif text-4xl text-foreground leading-none tracking-tight">
                          {p.price}
                        </span>
                        <span className="text-xs text-muted-foreground mb-1.5 font-medium">MXN</span>
                      </div>

                      <div className="space-y-2 mb-6 text-xs text-foreground/80">
                        <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold-primary" /> {p.tokens.toLocaleString('es-MX')} Tokens IA</p>
                        {key === 'max' && (
                          <p className="flex items-center gap-2 text-gold-primary font-bold">
                            <span className="w-1 h-1 rounded-full bg-gold-primary" /> Mejor valor por token
                          </p>
                        )}
                      </div>

                      <div className="mt-auto">
                        <button
                          type="button"
                          className="w-full py-3 text-center rounded-full bg-surface-bright border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:bg-gold-primary hover:text-[#121212] hover:border-gold-primary transition-all"
                        >
                          Generar CLABE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Columna derecha (1/3) ── */}
          <div className="space-y-6">
            {/* Resumen de cuenta */}
            <div className="card-depth rounded-3xl p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">Resumen</p>
              <h3 className="font-serif text-2xl text-foreground tracking-tight mt-1.5">Tu cuenta</h3>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd className="text-foreground font-semibold text-right">Demo Activa</dd>
                </div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">Rentas Fijas</dt>
                  <dd className="text-emerald-400 font-semibold text-right">$0.00 MXN (Prepago)</dd>
                </div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">Sistema</dt>
                  <dd>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En Línea
                    </span>
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">ID Negocio</dt>
                  <dd className="text-foreground/80 text-right font-mono text-xs">
                    {tenant.id.slice(0, 8)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Próxima renta</dt>
                  <dd className="text-foreground/80 text-right">Nunca</dd>
                </div>
              </dl>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <button
                  type="button"
                  className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  Ver Datos de Transferencia (CLABE)
                </button>
                <p className="text-[10px] text-muted-foreground/70 text-center mt-3">
                  Recargas validadas automáticamente vía SPEI
                </p>
              </div>
            </div>

            {/* Historial de pagos (placeholder visual) */}
            <div className="card-depth rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">Historial</p>
                  <h3 className="font-serif text-xl text-foreground tracking-tight mt-1.5">Facturas recientes</h3>
                </div>
                <Receipt className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>

              {isActive ? (
                <div className="space-y-3">
                  {/* Placeholder visual de facturas — la fuente real llegará del webhook */}
                  {[
                    { date: formatDate(tenant.current_period_end), amount: 150, status: 'paid' },
                    { date: formatDate(tenant.created_at), amount: 1900, status: 'paid' },
                  ].map((inv, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs text-foreground/90 font-medium">{inv.date}</p>
                          <p className="text-[10px] text-muted-foreground">Recarga de Saldo Amigo</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">$150.00 MXN</p>
                        <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Pagada</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground/70 text-center pt-2">
                    El listado completo se poblará desde los webhooks de Stripe.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-foreground/80 font-medium">Sin facturas aún</p>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Cuando actives un plan, aquí verás el historial de pagos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- CTA de upgrade final --- */}
        {/* --- CTA de upgrade final OMITIDO EN PREPAGO --- */}
      </div>
    </div>
  );
}
