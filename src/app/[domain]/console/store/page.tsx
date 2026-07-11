import { createAdminClient } from '@/lib/supabase/admin';
import { ShoppingBag, MessageSquare, LineChart, CreditCard, Zap, Share2, Copy } from 'lucide-react';
import Link from 'next/link';
import { PurchaseButton } from './PurchaseButton';

const MODULES = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Autopilot',
    description: 'La IA responderá y agendará citas directamente desde tu número de WhatsApp Business 24/7.',
    price: 149,
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'pos',
    title: 'Terminal de Caja (POS)',
    description: 'Cobra con tarjeta, emite tickets y controla tu flujo de efectivo desde un solo lugar.',
    price: 99,
    icon: CreditCard,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'analytics',
    title: 'Reportes Avanzados',
    description: 'Predicciones de ventas con IA, análisis de clientes y exportación contable en Excel.',
    price: 49,
    icon: LineChart,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  }
];

export default async function PartnerStorePage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const supabase = createAdminClient();
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, active_modules, referrals_count, referral_code')
    .eq('subdomain', params.domain)
    .single();

  if (!tenant) return <div>Inquilino no encontrado</div>;

  const activeModules = tenant.active_modules || ['core'];
  const referrals = tenant.referrals_count || 0;
  const referralGoal = 5;
  const referralPercentage = Math.min(100, Math.round((referrals / referralGoal) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-gold-primary" />
          </div>
          <h1 className="text-3xl font-serif">Marketplace de Módulos</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Expande las capacidades de tu software. Paga una sola vez y desbloquea herramientas premium de por vida.
        </p>
      </header>

      {/* REFERRAL SYSTEM (Growth Loop) */}
      <section className="bg-gradient-to-r from-gold-primary/20 via-black/40 to-black/40 border border-gold-primary/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Share2 className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-2 text-gold-light">Desbloquea Módulos GRATIS</h2>
            <p className="text-sm text-white/80 mb-6">
              Invita a 5 dueños de negocio usando tu enlace. Cuando ellos se unan, te regalamos un módulo al 50% y saldo para tu IA.
            </p>
            
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="font-mono text-sm text-gold-primary break-all">
                app.tu-dominio.com/join?ref={tenant.referral_code || 'TBD'}
              </div>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">Progreso de Referidos</p>
            <div className="flex justify-center items-end gap-2 mb-4">
              <span className="text-5xl font-serif text-white">{referrals}</span>
              <span className="text-xl text-white/30 mb-1">/ {referralGoal}</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gold-primary rounded-full transition-all duration-1000"
                style={{ width: `${referralPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">
              {referrals >= referralGoal ? '¡Recompensa Desbloqueada!' : `Faltan ${referralGoal - referrals} amigos`}
            </p>
          </div>
        </div>
      </section>

      {/* MODULES GRID */}
      <div>
        <h3 className="text-lg font-bold mb-6">Módulos Disponibles</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            const isPurchased = activeModules.includes(mod.id);
            
            return (
              <div key={mod.id} className={`rounded-3xl border p-6 flex flex-col h-full ${mod.bg} relative overflow-hidden transition-all hover:scale-[1.02]`}>
                {isPurchased && (
                  <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                    Comprado
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 ${mod.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h4 className="text-xl font-bold mb-2">{mod.title}</h4>
                <p className="text-sm text-white/60 mb-8 flex-1 leading-relaxed">{mod.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                  <div className="text-2xl font-serif font-bold">
                    ${mod.price} <span className="text-[10px] text-white/40 uppercase tracking-widest font-sans">Pago Único</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  {isPurchased ? (
                    <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/30 text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                      Instalado
                    </button>
                  ) : (
                    <PurchaseButton tenantId={tenant.id} moduleId={mod.id} price={mod.price} title={mod.title} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* TOKENS GRID */}
      <div>
        <h3 className="text-lg font-bold mb-6">Recargas de IA (Tokens)</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/20 border border-white/5 rounded-3xl p-6 text-center hover:border-gold-primary/30 transition-colors">
            <Zap className="w-8 h-8 text-gold-primary mx-auto mb-4" />
            <h4 className="font-bold mb-1">Pack Inicial</h4>
            <p className="text-xs text-muted-foreground mb-4">+10,000 interacciones</p>
            <p className="text-2xl font-serif mb-6">$15 <span className="text-[10px]">USD</span></p>
            <PurchaseButton tenantId={tenant.id} moduleId="tokens_10k" price={15} title="Pack 10k Tokens" />
          </div>
          
          <div className="bg-gold-primary/5 border border-gold-primary/30 rounded-3xl p-6 text-center hover:bg-gold-primary/10 transition-colors relative">
            <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center">
              <span className="bg-gold-primary text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Más Popular</span>
            </div>
            <Zap className="w-8 h-8 text-gold-primary mx-auto mb-4" />
            <h4 className="font-bold mb-1">Pack Crecimiento</h4>
            <p className="text-xs text-muted-foreground mb-4">+50,000 interacciones</p>
            <p className="text-2xl font-serif mb-6">$49 <span className="text-[10px]">USD</span></p>
            <PurchaseButton tenantId={tenant.id} moduleId="tokens_50k" price={49} title="Pack 50k Tokens" />
          </div>
          
          <div className="bg-black/20 border border-white/5 rounded-3xl p-6 text-center hover:border-gold-primary/30 transition-colors">
            <Zap className="w-8 h-8 text-gold-primary mx-auto mb-4" />
            <h4 className="font-bold mb-1">Pack Enterprise</h4>
            <p className="text-xs text-muted-foreground mb-4">+200,000 interacciones</p>
            <p className="text-2xl font-serif mb-6">$149 <span className="text-[10px]">USD</span></p>
            <PurchaseButton tenantId={tenant.id} moduleId="tokens_200k" price={149} title="Pack 200k Tokens" />
          </div>
        </div>
      </div>

    </div>
  );
}
