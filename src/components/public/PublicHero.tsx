'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { OpenChatButton } from '@/components/OpenChatButton';
import { ArrowDown } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function PublicHero() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center w-full pt-8 pb-16"
    >
      {/* Status badge */}
      <motion.div
        variants={item}
        className="inline-flex items-center gap-2.5 border border-[#ff0055]/30 bg-[#ff0055]/10 text-[#ff0055] px-4 py-1.5 text-[9px] font-black tracking-[0.3em] uppercase mb-12 shadow-[0_0_20px_rgba(255,0,85,0.15)] backdrop-blur-sm"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff0055] opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ff0055]" />
        </span>
        Estado Global: Online
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={item}
        className="text-center font-black text-5xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] uppercase mb-8 max-w-6xl"
      >
        Ingeniería{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-600">
          Web
        </span>
        <br />
        <span className="text-[#ff0055] font-serif italic font-light lowercase text-6xl md:text-8xl">
          de
        </span>{' '}
        Alto Calibre
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        variants={item}
        className="text-center text-neutral-400 text-sm md:text-lg max-w-2xl font-light tracking-wide leading-relaxed mb-12"
      >
        Sistemas B2B con arquitectura Zero Trust y Asistentes de IA integrados
        que agendan citas 24/7. Deja de usar plantillas genéricas. Escala con
        código puro.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row gap-6 items-center mb-8"
      >
        <OpenChatButton />
        <Link
          href="#arquitectura"
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-[#ff0055] transition-all underline decoration-neutral-800 hover:decoration-[#ff0055] underline-offset-4"
        >
          Ver Arquitectura
          <ArrowDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>

    </motion.div>
  );
}
