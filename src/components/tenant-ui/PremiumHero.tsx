'use client';

import { motion } from 'framer-motion';

export function PremiumHero({
  name,
  tagline,
  heroImage,
  theme,
  font
}: {
  name: string;
  tagline: string;
  heroImage: string;
  theme: string;
  font: string;
}) {
  const isDark = theme === 'dark-luxury' || theme === 'neon-cyber';
  const isNeon = theme === 'neon-cyber';
  
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src={heroImage} 
          alt="Premium Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlays to guarantee readability */}
        <div className={`absolute inset-0 ${isDark ? 'bg-black/50' : 'bg-white/40'}`}></div>
        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#111317] via-black/20' : 'from-[#fafafa] via-white/20'} to-transparent`}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 flex flex-col items-center justify-center px-6 md:px-12 max-w-6xl mx-auto text-center w-full"
      >
        <span className={`text-xs md:text-sm uppercase tracking-[0.5em] font-bold ${isNeon ? 'text-[#00ff9d]' : isDark ? 'text-white/80' : 'text-black/60'} drop-shadow-lg mb-8 block w-full text-center`}>
          Bienvenido a la Experiencia
        </span>
        
        <h1 className={`${font === 'serif' ? 'font-serif' : font === 'mono' ? 'font-mono' : 'font-sans'} text-5xl sm:text-6xl md:text-8xl lg:text-[8rem] ${isDark ? 'text-white' : 'text-black'} leading-[0.9] mb-8 md:mb-12 ${isNeon ? 'drop-shadow-[0_0_20px_rgba(0,255,157,0.5)]' : 'drop-shadow-lg'} tracking-tight w-full flex flex-col items-center`}>
          <span>{name}.</span>
        </h1>
        
        <p className={`text-lg sm:text-xl md:text-3xl ${isDark ? 'text-white/95' : 'text-black/90'} font-light mb-16 max-w-4xl ${isNeon ? 'drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]' : 'drop-shadow-md'} leading-[1.6] text-center`}>
          {tagline}
        </p>
        
        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="mt-16 opacity-60"
        >
          <div className={`w-px h-24 bg-gradient-to-b ${isNeon ? 'from-[#00ff9d]' : isDark ? 'from-white' : 'from-black'} to-transparent mx-auto`}></div>
        </motion.div>
      </motion.div>
    </section>
  );
}
