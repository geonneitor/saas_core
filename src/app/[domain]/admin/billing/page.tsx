import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Sparkles, Calendar, Receipt, ArrowUpRight, Crown, AlertCircle } from 'lucide-react';
import TokenUsageBar from './TokenUsageBar';
import StripeCheckoutButton from './StripeCheckoutButton';

type PlanKey = 'starter' | 'premium' | 'elite';

const PLAN_CATALOG: Record<PlanKey, { name: string; price: number; tokens: number; tagline: string }> = {
  starter: { name: 'Agenda Base', price: 0, tokens: 0, tagline: 'Sistema de reservas manual. Incluido en tu implementación inicial.' },
  premium: { name: 'IA Concierge', price: 29, tokens: 1000, tagline: 'Asistente IA 24/7, agendamiento automático y gestión inteligente.' },
  elite: { name: 'Scale', price: 59, tokens: 5000, tagline: 'Para negocios con alto volumen de citas y clientes recurrentes.' },
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

  // 3. Derivar info del plan actual
  const currentPlanKey = (tenant.subscription_plan as PlanKey) || 'starter';
  const currentPlan = PLAN_CATALOG[currentPlanKey] || PLAN_CATALOG.starter;
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
            Tu suscripción, <span className="italic text-gold-primary">bajo control.</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Monitorea tu consumo de IA, gestiona tu plan y revisa el historial de pagos.
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
                        Período Actual
                      </p>
                      <p className="font-serif text-lg text-foreground mt-0.5">
                        {renewDate ? `Renueva el ${formatDate(tenant.current_period_end)}` : 'Sin renovación programada'}
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

                <TokenUsageBar used={tokensUsed} limit={tokensLimit} planName={currentPlan.name} />
              </div>
            </div>

            {/* Tabla de comparación de planes (3 columnas) */}
            <div className="card-depth rounded-3xl p-8 md:p-10">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">Planes</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-tight mt-1.5">
                    Escala cuando tu negocio lo pida.
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
                {(Object.keys(PLAN_CATALOG) as PlanKey[]).map((key) => {
                  const p = PLAN_CATALOG[key];
                  const isCurrent = key === currentPlanKey && isActive;
                  return (
                    <div
                      key={key}
                      className={`relative rounded-2xl p-6 flex flex-col transition-all
                        ${
                          isCurrent
                            ? 'bg-gradient-to-b from-gold-primary/10 via-surface to-surface border border-gold-primary/40 shadow-gold-glow-sm'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/15'
                        }
                      `}
                    >
                      {isCurrent && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] text-[9px] font-black uppercase tracking-[0.2em]">
                          Tu plan
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        {key === 'elite' ? (
                          <Crown className="w-4 h-4 text-gold-primary" strokeWidth={2} />
                        ) : key === 'premium' ? (
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
                        <span className="text-xs text-muted-foreground mb-1.5 font-medium">/mes</span>
                      </div>

                      <div className="space-y-2 mb-6 text-xs text-foreground/80">
                        {key === 'starter' && (
                          <>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold-primary" /> Sistema de Reservas</p>
                            <p className="flex items-center gap-2 opacity-50"><span className="w-1 h-1 rounded-full bg-muted-foreground" /> Sin Automatización IA</p>
                          </>
                        )}
                        {key === 'premium' && (
                          <>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold-primary" /> Asistente IA Inteligente 24/7</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold-primary" /> Dominio Exclusivo y Calendario</p>
                          </>
                        )}
                        {key === 'elite' && (
                          <>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold-primary" /> Todo lo de IA Concierge</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold-primary" /> Alto volumen de clientes</p>
                          </>
                        )}
                      </div>

                      <div className="mt-auto">
                        {isCurrent ? (
                          <div className="w-full py-3 text-center rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Plan activo
                          </div>
                        ) : (
                          <StripeCheckoutButton
                            plan={key}
                            cycle="monthly"
                            label={`Cambiar a ${p.name}`}
                            variant="secondary"
                          />
                        )}
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
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="text-foreground font-semibold text-right">{currentPlan.name}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">Costo mensual</dt>
                  <dd className="text-foreground font-semibold text-right">${currentPlan.price}.00 USD</dd>
                </div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border
                        ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="text-foreground/80 text-right font-mono text-xs">
                    {tenant.stripe_customer_id ? tenant.stripe_customer_id.slice(0, 14) + '…' : 'No asignado'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Próxima renovación</dt>
                  <dd className="text-foreground/80 text-right">{formatDate(tenant.current_period_end)}</dd>
                </div>
              </dl>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <button
                  type="button"
                  className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all"
                  title="Próximamente: gestionar método de pago vía Stripe Customer Portal"
                >
                  Gestionar método de pago
                </button>
                <p className="text-[10px] text-muted-foreground/70 text-center mt-3">
                  Conectado al Stripe Customer Portal (próximamente)
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
                    { date: formatDate(tenant.current_period_end), amount: currentPlan.price, status: 'paid' },
                    { date: formatDate(tenant.created_at), amount: currentPlan.price, status: 'paid' },
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
                          <p className="text-[10px] text-muted-foreground">Suscripción · {currentPlan.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${inv.amount}.00</p>
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
        {!isActive && (
          <div className="relative overflow-hidden card-depth rounded-3xl p-10 md:p-14 text-center space-y-6">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />
            <Crown className="w-12 h-12 text-gold-primary mx-auto" strokeWidth={1.5} />
            <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight max-w-2xl mx-auto leading-tight">
              Activa tu plan y desbloquea todo el potencial de tu asistente IA.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configuración en menos de 2 minutos. Cancela cuando quieras.
            </p>
            <div className="pt-2 max-w-sm mx-auto">
              <StripeCheckoutButton plan="premium" cycle="monthly" label="Activar Premium ahora" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
