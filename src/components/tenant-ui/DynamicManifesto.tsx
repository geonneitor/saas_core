'use client';

import { motion } from 'framer-motion';

export function DynamicManifesto({ theme, font }: { theme: string, font: string }) {
  const isDark = theme === 'dark-luxury' || theme === 'neon-cyber';
  const isNeon = theme === 'neon-cyber';

  return (
    <section className={`px-6 md:px-12 py-24 md:py-40 flex justify-center items-center ${isDark ? 'bg-[#111317] text-white' : 'bg-[#fafafa] text-black'} relative overflow-hidden transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-4xl text-center relative z-10"
      >
        <span className={`text-[10px] md:text-xs uppercase tracking-[0.3em] ${isNeon ? 'text-[#00ff9d]' : 'text-primary'} font-bold mb-6 block`}>
          Nuestra Promesa
        </span>
        
        <h2 className={`${font === 'serif' ? 'font-serif' : font === 'mono' ? 'font-mono' : 'font-sans'} text-3xl md:text-5xl lg:text-6xl font-normal leading-tight mb-8`}>
          Diseñamos experiencias. <br/>
          <span className="italic font-light">Optimizamos tu tiempo.</span>
        </h2>
        
        <p className={`text-sm md:text-lg ${isDark ? 'text-white/70' : 'text-black/70'} leading-relaxed max-w-2xl mx-auto font-light`}>
          En el ritmo acelerado de hoy, el verdadero lujo es el tiempo y la atención al detalle. 
          Nuestro servicio no solo busca la perfección técnica, sino crear un momento de pausa 
          y exclusividad diseñado totalmente para ti.
        </p>
      </motion.div>
    </section>
  );
}
