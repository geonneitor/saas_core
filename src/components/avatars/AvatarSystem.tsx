"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AvatarVariant = 'lotito' | 'orb' | 'cat' | 'robot' | 'star';

interface AvatarProps {
  variant: AvatarVariant;
  isActive?: boolean;
}

export function AvatarSystem({ variant, isActive = false }: AvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  // --- 1. LOTITO (El clásico) ---
  const renderLotito = () => (
    <motion.svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ overflow: 'visible' }}>
      <g>
        <circle cx="50" cy="50" r="35" fill="#bef264" opacity="0.15" />
        <path d="M50 85 C30 85, 10 70, 10 50 C30 65, 45 75, 50 85 Z" fill="#65a30d" opacity="0.8" />
        <path d="M50 85 C70 85, 90 70, 90 50 C70 65, 55 75, 50 85 Z" fill="#65a30d" opacity="0.8" />
        <path d="M50 80 C20 70, 5 45, 15 25 C25 45, 40 60, 50 80 Z" fill="#84cc16" />
        <path d="M50 80 C80 70, 95 45, 85 25 C75 45, 60 60, 50 80 Z" fill="#84cc16" />
        <path d="M50 80 C30 60, 20 30, 35 15 C40 35, 45 55, 50 80 Z" fill="#a3e635" />
        <path d="M50 80 C70 60, 80 30, 65 15 C60 35, 55 55, 50 80 Z" fill="#a3e635" />
        <path d="M50 80 C40 50, 35 20, 50 5 C65 20, 60 50, 50 80 Z" fill="#d9f99d" />
        
        <g transform="translate(42, 45)">
          <motion.ellipse cx="2" cy="0" rx="2.5" ry="3" fill="#166534" animate={{ scaleY: [1, 0.1, 1, 1, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.ellipse cx="14" cy="0" rx="2.5" ry="3" fill="#166534" animate={{ scaleY: [1, 0.1, 1, 1, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          {isActive || isHovered ? (
            <path d="M 1 5 Q 8 13 15 5" stroke="#166534" strokeWidth="2.5" fill="none" />
          ) : (
            <path d="M 3 6 Q 8 10 13 6" stroke="#166534" strokeWidth="2" fill="none" />
          )}
          <motion.ellipse cx="-1" cy="4" rx="2.5" ry="1.5" fill="#fca5a5" initial={{ opacity: 0.6 }} animate={isActive ? { opacity: 0.9, scale: 1.5 } : {}} />
          <motion.ellipse cx="17" cy="4" rx="2.5" ry="1.5" fill="#fca5a5" initial={{ opacity: 0.6 }} animate={isActive ? { opacity: 0.9, scale: 1.5 } : {}} />
        </g>
      </g>
    </motion.svg>
  );

  // --- 2. ORBE MINIMALISTA (Elegante) ---
  const renderOrb = () => (
    <motion.svg width="48" height="48" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="orbGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      <motion.circle 
        cx="50" cy="50" r={isActive ? "45" : "40"} 
        fill="url(#orbGlow)" 
        animate={{ 
          scale: isActive ? [1, 1.05, 1] : 1,
          opacity: isActive ? 1 : 0.8
        }} 
        transition={{ duration: 2, repeat: Infinity }} 
      />
      {isActive && (
        <motion.circle cx="50" cy="50" r="48" stroke="#d8b4fe" strokeWidth="2" fill="none" animate={{ scale: [1, 1.2], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
      )}
    </motion.svg>
  );

  // --- 3. GATO KAWAII (Mascotas / Estéticas) ---
  const renderCat = () => (
    <motion.svg width="48" height="48" viewBox="0 0 100 100" fill="none">
      <g>
        {/* Orejas */}
        <path d="M20 50 L10 20 L40 30 Z" fill="#fcd34d" />
        <path d="M80 50 L90 20 L60 30 Z" fill="#fcd34d" />
        {/* Cara */}
        <circle cx="50" cy="55" r="35" fill="#fde68a" />
        {/* Ojos */}
        <motion.circle cx="35" cy="50" r="5" fill="#1c1917" animate={{ scaleY: [1, 0.1, 1, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="65" cy="50" r="5" fill="#1c1917" animate={{ scaleY: [1, 0.1, 1, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        {/* Boca (Sonrisa Gato) */}
        <path d="M45 60 Q50 65 50 60 Q50 65 55 60" stroke="#1c1917" strokeWidth="3" fill="none" strokeLinecap="round" />
        {isActive && <motion.circle cx="25" cy="60" r="4" fill="#fca5a5" opacity="0.7" />}
        {isActive && <motion.circle cx="75" cy="60" r="4" fill="#fca5a5" opacity="0.7" />}
      </g>
    </motion.svg>
  );

  // --- 4. ROBOT EJECUTIVO (Corporativo) ---
  const renderRobot = () => (
    <motion.svg width="48" height="48" viewBox="0 0 100 100" fill="none">
      <g>
        <rect x="25" y="30" width="50" height="45" rx="10" fill="#94a3b8" />
        {/* Antena */}
        <line x1="50" y1="30" x2="50" y2="15" stroke="#64748b" strokeWidth="4" />
        <motion.circle cx="50" cy="15" r="5" fill={isActive ? "#ef4444" : "#cbd5e1"} animate={isActive ? { opacity: [1, 0.5, 1] } : {}} transition={{ duration: 1, repeat: Infinity }} />
        {/* Ojos Visor */}
        <rect x="35" y="45" width="30" height="10" rx="5" fill="#1e293b" />
        <motion.circle cx="42" cy="50" r="2.5" fill="#38bdf8" animate={{ x: isActive ? [0, 4, 0, -4, 0] : 0 }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="58" cy="50" r="2.5" fill="#38bdf8" animate={{ x: isActive ? [0, -4, 0, 4, 0] : 0 }} transition={{ duration: 2, repeat: Infinity }} />
      </g>
    </motion.svg>
  );

  // --- 5. ESTRELLA (Magia / Premium) ---
  const renderStar = () => (
    <motion.svg width="48" height="48" viewBox="0 0 100 100" fill="none">
      <motion.path 
        d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" 
        fill="#fbbf24" 
        animate={{ rotate: isActive ? 360 : 0, scale: isActive ? [1, 1.1, 1] : 1 }} 
        transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }} 
      />
      <circle cx="50" cy="50" r="15" fill="#fef08a" />
      <motion.circle cx="45" cy="48" r="2" fill="#78350f" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.circle cx="55" cy="48" r="2" fill="#78350f" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <path d="M48 55 Q50 58 52 55" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  );

  return (
    <motion.div 
      className="relative flex items-center justify-center cursor-pointer drop-shadow-md"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={isActive ? { y: [0, -4, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {variant === 'lotito' && renderLotito()}
      {variant === 'orb' && renderOrb()}
      {variant === 'cat' && renderCat()}
      {variant === 'robot' && renderRobot()}
      {variant === 'star' && renderStar()}
    </motion.div>
  );
}
