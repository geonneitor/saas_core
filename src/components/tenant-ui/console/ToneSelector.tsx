'use client';

import { useState, useTransition } from 'react';
import { updateAiSettings } from '@/app/[domain]/actions';
import { Check, Star, HeartHandshake, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TONES = [
  { 
    id: 'VIP y Exclusivo', 
    label: 'VIP & Exclusivo', 
    icon: Star,
    desc: 'Usa lenguaje sofisticado, trata al cliente de usted y enfatiza la exclusividad.',
    prompt: 'Eres un conserje de lujo. Usa un tono extremadamente educado, sofisticado y exclusivo. Dirígete siempre de "usted".'
  },
  { 
    id: 'Amigable y Cercano', 
    label: 'Amigable & Cercano', 
    icon: HeartHandshake,
    desc: 'Trato cálido, usa emojis, tutea al cliente y lo hace sentir como en casa.',
    prompt: 'Eres un asistente súper amigable y cálido. Usa emojis con naturalidad, tutea al cliente y hazlo sentir en confianza.'
  },
  { 
    id: 'Directo y Profesional', 
    label: 'Directo & Profesional', 
    icon: Briefcase,
    desc: 'Respuestas cortas, al grano, enfocadas a la eficiencia sin rodeos.',
    prompt: 'Eres un asistente altamente eficiente y directo. Da respuestas cortas, claras y al grano sin rodeos innecesarios.'
  }
];

export function ToneSelector({ tenantId, currentTone }: { tenantId: string, currentTone: string }) {
  const [active, setActive] = useState(currentTone);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (tone: typeof TONES[0]) => {
    setActive(tone.id);
    startTransition(async () => {
      // Guardamos el tono y de paso pre-configuramos el prompt principal para facilitar las cosas
      await updateAiSettings(tenantId, { ai_tone: tone.id, ai_prompt: tone.prompt });
      router.refresh();
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {TONES.map(tone => {
        const Icon = tone.icon;
        const isActive = active === tone.id;
        
        return (
          <button
            key={tone.id}
            onClick={() => handleSelect(tone)}
            disabled={isPending}
            className={`relative text-left p-6 rounded-2xl border transition-all duration-300 ${
              isActive 
                ? 'bg-gold-primary/10 border-gold-primary shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isActive && (
              <div className="absolute top-4 right-4 text-gold-primary">
                <Check className="w-5 h-5" />
              </div>
            )}
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isActive ? 'bg-gold-primary/20 text-gold-light' : 'bg-white/5 text-white/50'}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <h3 className={`font-bold mb-2 ${isActive ? 'text-gold-light' : 'text-white'}`}>{tone.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{tone.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
