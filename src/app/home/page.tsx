'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  ShieldCheck,
  Brain,
  Phone,
  CalendarClock,
  MessageSquare,
  Users,
  Star,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

// ----------------------------------------------------------------
// Data: planes
// ----------------------------------------------------------------
type Plan = {
  id: 'starter' | 'premium' | 'elite';
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  icon: React.ReactNode;
  highlighted?: boolean;
  cta: string;
  features: { icon: React.ReactNode; text: string }[];
};

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Para emprendedores que inician su transformación digital.',
    monthly: 29,
    yearly: 290,
    icon: <Zap className="w-5 h-5" />,
    cta: 'Comenzar ahora',
    features: [
      { icon: <Brain className="w-4 h-4" />, text: '500 Tokens IA / mes' },
      { icon: <MessageSquare className="w-4 h-4" />, text: 'Asistente conversacional básico' },
      { icon: <CalendarClock className="w-4 h-4" />, text: 'Reservas automáticas 24/7' },
      { icon: <Users className="w-4 h-4" />, text: 'Hasta 100 clientes' },
      { icon: <ShieldCheck className="w-4 h-4" />, text: 'Soporte por email' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'La elección de los negocios que buscan escalar sin fricción.',
    monthly: 79,
    yearly: 790,
    icon: <Sparkles className="w-5 h-5" />,
    highlighted: true,
    cta: 'Obtener Premium',
    features: [
      { icon: <Brain className="w-4 h-4" />, text: '2,000 Tokens IA / mes' },
      { icon: <MessageSquare className="w-4 h-4" />, text: 'Asistente con voz y tool-calling' },
      { icon: <CalendarClock className="w-4 h-4" />, text: 'Reservas, cancelaciones y reagendas' },
      { icon: <Users className="w-4 h-4" />, text: 'Clientes ilimitados' },
      { icon: <Phone className="w-4 h-4" />, text: 'Subdominio personalizado' },
      { icon: <ShieldCheck className="w-4 h-4" />, text: 'Soporte prioritario en 24h' },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'Para cadenas y marcas que exigen una experiencia a la altura.',
    monthly: 199,
    yearly: 1990,
    icon: <Crown className="w-5 h-5" />,
    cta: 'Contactar a ventas',
    features: [
      { icon: <Brain className="w-4 h-4" />, text: '10,000 Tokens IA / mes' },
      { icon: <MessageSquare className="w-4 h-4" />, text: 'Asistente con fine-tuning de marca' },
      { icon: <CalendarClock className="w-4 h-4" />, text: 'Múltiples sucursales y staff' },
      { icon: <Users className="w-4 h-4" />, text: 'Roles, equipos y permisos' },
      { icon: <Phone className="w-4 h-4" />, text: 'Dominio propio + SSL gestionado' },
      { icon: <ShieldCheck className="w-4 h-4" />, text: 'Account Manager dedicado' },
    ],
  },
];

const FAQ = [
  {
    q: '¿Qué son los "Tokens IA"?',
    a: 'Es la unidad que mide el uso del asistente conversacional. Cada conversación consume una cantidad variable de tokens según la complejidad. Si te quedas sin tokens, el asistente pausa hasta el próximo ciclo, sin cobrar extra.',
  },
  {
    q: '¿Puedo cambiar de plan o cancelar en cualquier momento?',
    a: 'Sí. Puedes subir, bajar o cancelar tu plan cuando quieras desde el panel de Facturación. El cargo prorrateado se aplica automáticamente y no hay penalizaciones por cancelación.',
  },
  {
    q: '¿Necesito conocimientos técnicos para empezar?',
    a: 'Ninguno. Configuramos tu subdominio, el avatar del asistente y los tonos de marca por ti. En menos de 15 minutos estás recibiendo reservas reales.',
  },
  {
    q: '¿Mis datos y los de mis clientes están seguros?',
    a: 'Totalmente. Usamos Supabase con Row Level Security estricto: ningún tenant puede ver los datos de otro. Además cumplimos con buenas prácticas GDPR y los pagos van cifrados vía Stripe.',
  },
];

// ----------------------------------------------------------------
// Anim variants
// ----------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------
function PriceCard({ plan, billing }: { plan: Plan; billing: 'monthly' | 'yearly' }) {
  const price = billing === 'monthly' ? plan.monthly : Math.round(plan.yearly / 12);
  const savings = billing === 'yearly' ? Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100) : 0;

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group rounded-3xl p-8 lg:p-10 flex flex-col h-full
        ${
          plan.highlighted
            ? 'bg-gradient-to-b from-[#1A1C20] via-[#14161A] to-[#0E0F12] border border-gold-primary/40 shadow-[0_30px_80px_-30px_rgba(229,193,88,0.45)]'
            : 'bg-[#111317] border border-white/[0.06] hover:border-white/15'
        }
        transition-all duration-500
      `}
    >
      {/* Halo para el plan destacado */}
      {plan.highlighted && (
        <>
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-gold-light/30 via-gold-primary/20 to-transparent blur-2xl -z-10 opacity-60" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] text-[10px] font-bold uppercase tracking-[0.2em] shadow-gold-glow">
            ★ Más Popular
          </div>
        </>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center
            ${plan.highlighted ? 'bg-gold-primary/15 text-gold-primary border border-gold-primary/30' : 'bg-white/5 text-foreground/80 border border-white/10'}
          `}
        >
          {plan.icon}
        </div>
        <h3 className="font-serif text-2xl text-foreground tracking-tight">{plan.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">{plan.tagline}</p>

      {/* Price */}
      <div className="mt-8 mb-2 flex items-end gap-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-3">$</span>
        <span className="font-serif text-6xl text-foreground leading-none tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground mb-2 font-medium">/ mes</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {billing === 'yearly' ? (
          <>
            Facturado anualmente · <span className="text-gold-primary font-semibold">Ahorras {savings}%</span>
          </>
        ) : (
          'Facturado mensualmente · Cancela cuando quieras'
        )}
      </p>

      {/* Divider decorativo */}
      <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Features */}
      <ul className="space-y-3.5 mb-10 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0
                ${plan.highlighted ? 'bg-gold-primary/15 text-gold-primary border border-gold-primary/30' : 'bg-white/5 text-foreground/70 border border-white/10'}
              `}
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/85 leading-snug">{f.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/admin/billing?plan=${plan.id}&cycle=${billing}`}
        className={`group/cta inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300
          ${
            plan.highlighted
              ? 'bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] shadow-gold-glow hover:shadow-[0_10px_40px_-5px_rgba(229,193,88,0.6)] hover:-translate-y-0.5'
              : 'bg-white/5 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20'
          }
        `}
      >
        {plan.cta}
        <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
      >
        <span className="font-serif text-lg md:text-xl text-foreground tracking-tight group-hover:text-gold-primary transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-gold-primary' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">{a}</p>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main page
// ----------------------------------------------------------------
export default function SaaSLandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-gold-primary/30 selection:text-gold-light overflow-x-hidden">
      {/* --- Top Nav --- */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/70 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-light to-gold-primary flex items-center justify-center shadow-gold-glow-sm">
              <Sparkles className="w-4 h-4 text-[#121212]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-serif text-lg tracking-tight leading-none">Boutique AI</p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">SaaS Core</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="#planes"
              className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Planes
            </a>
            <a
              href="#faq"
              className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              FAQ
            </a>
            <Link
              href="/admin/billing"
              className="btn-premium-gold px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Ir al Panel
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero --- */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 px-6">
        {/* Ambient gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gold-primary/[0.06] rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold-primary/[0.04] rounded-full blur-[100px] -z-10 pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-primary/10 border border-gold-primary/30 text-gold-primary text-[10px] font-bold uppercase tracking-[0.3em]">
              <Star className="w-3 h-3" strokeWidth={2.5} />
              Reservas Premium con Inteligencia Artificial
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground tracking-tight leading-[1.02]"
          >
            El concierge digital
            <br />
            <span className="bg-gradient-to-r from-gold-light via-gold-primary to-gold-dark bg-clip-text text-transparent italic">
              que tu negocio merece.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
          >
            Un asistente de IA que responde, agenda y convierte a tus clientes 24/7.
            <span className="text-foreground/80"> Sin llamadas perdidas. Sin excusas. Sin fricción.</span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a
              href="#planes"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] text-sm font-bold uppercase tracking-[0.2em] shadow-gold-glow hover:shadow-[0_10px_40px_-5px_rgba(229,193,88,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Empezar 14 días gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 text-foreground text-sm font-semibold tracking-wide hover:border-white/25 hover:bg-white/[0.03] transition-all duration-300"
            >
              Ver cómo funciona
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="text-xs text-muted-foreground/80 pt-2"
          >
            Sin tarjeta de crédito · Cancela cuando quieras
          </motion.p>
        </motion.div>
      </section>

      {/* --- Trust strip --- */}
      <section className="border-y border-white/[0.05] bg-surface/30">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '+12k', l: 'Reservas procesadas' },
            { n: '98%', l: 'Satisfacción' },
            { n: '<3s', l: 'Tiempo de respuesta' },
            { n: '24/7', l: 'Disponibilidad total' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="font-serif text-3xl md:text-4xl text-gold-primary tracking-tight">{s.n}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-semibold">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="planes" className="py-24 md:py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-14 space-y-4"
          >
            <motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">
              Membresía
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl text-foreground tracking-tight"
            >
              Elige el nivel de experiencia.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Empieza con lo esencial, escala cuando tu negocio lo pida.
            </motion.p>

            {/* Billing toggle */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-1 p-1.5 mt-6 rounded-full bg-surface border border-white/10"
            >
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`relative px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300
                    ${billing === b ? 'text-[#121212]' : 'text-muted-foreground hover:text-foreground'}
                  `}
                >
                  {billing === b && (
                    <motion.span
                      layoutId="billingPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-light to-gold-primary shadow-gold-glow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    {b === 'monthly' ? 'Mensual' : 'Anual'}
                    {b === 'yearly' && (
                      <span className="ml-2 text-[9px] text-gold-primary font-black">−17%</span>
                    )}
                  </span>
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Plan grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
          >
            {PLANS.map((p) => (
              <PriceCard key={p.id} plan={p} billing={billing} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Feature comparison hint --- */}
      <section id="como-funciona" className="py-24 px-6 bg-surface/40 border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">
              El detalle importa
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
              No es un chatbot. <br />
              <span className="text-gold-primary italic">Es tu mejor empleado.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
              Cada plan incluye un asistente afinado para tu tipo de negocio. Habla con tus clientes en su idioma,
              reconoce sus intenciones y cierra reservas reales con tu calendario. Sin formularios. Sin esperas.
            </motion.p>
            <motion.ul variants={fadeUp} className="space-y-3 pt-2">
              {[
                'Conecta con tu Google Calendar en 1-click',
                'Reconoce clientes recurrentes por nombre y teléfono',
                'Reagenda automáticamente ante conflictos',
                'Reportes diarios de citas por WhatsApp / email',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground/80">
                  <Check className="w-4 h-4 mt-0.5 text-gold-primary shrink-0" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative card-depth rounded-3xl p-8 lg:p-10 space-y-5"
          >
            <div className="absolute -top-3 left-8 px-4 py-1 rounded-full bg-gold-primary/15 border border-gold-primary/40 text-gold-primary text-[10px] font-bold uppercase tracking-[0.2em]">
              Demo en vivo
            </div>
            {[
              { who: 'Cliente', msg: 'Hola, ¿tienen disponibilidad para el sábado a las 7pm?' },
              { who: 'Boutique AI', msg: '¡Hola! Claro que sí. El sábado a las 19:00 tengo un espacio disponible. ¿A nombre de quién?', gold: true },
              { who: 'Cliente', msg: 'A nombre de Sofía. Y por favor, el servicio premium.' },
              { who: 'Boutique AI', msg: 'Listo Sofía. Reservé tu servicio premium para el sábado 12 a las 19:00. Te enviaré un recordatorio 24h antes. ✨', gold: true },
            ].map((m, i) => (
              <div
                key={i}
                className={`flex ${m.gold ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${
                    m.gold
                      ? 'bg-gold-primary/10 border border-gold-primary/25 text-foreground rounded-tl-sm'
                      : 'bg-white/5 border border-white/10 text-foreground/80 rounded-tr-sm'
                  }
                `}
                >
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1.5">
                    {m.who}
                  </p>
                  {m.msg}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12 space-y-3"
          >
            <motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[0.3em] text-gold-primary font-bold">
              Preguntas Frecuentes
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
              Lo que todos preguntan.
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-depth rounded-3xl px-6 md:px-10 divide-y divide-white/[0.06]"
          >
            {FAQ.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-24 md:py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-primary/[0.04] to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center space-y-8 relative"
        >
          <Crown className="w-12 h-12 text-gold-primary mx-auto" strokeWidth={1.5} />
          <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight leading-tight">
            Tu próxima cita ya puede <br />
            <span className="bg-gradient-to-r from-gold-light via-gold-primary to-gold-dark bg-clip-text text-transparent italic">
              estar reservándose.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Únete a los negocios que dejaron de perder clientes mientras duermen.
          </p>
          <Link
            href="/admin/billing"
            className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] text-sm font-bold uppercase tracking-[0.2em] shadow-gold-glow hover:shadow-[0_15px_50px_-5px_rgba(229,193,88,0.6)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Activar mi cuenta
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-light to-gold-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#121212]" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Boutique AI · SaaS Core.</p>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Hecho con atención al detalle
          </p>
        </div>
      </footer>
    </div>
  );
}
