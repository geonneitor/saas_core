"use client";

import { useState } from 'react';
import { updateAiSettings } from '@/app/[domain]/actions';
import { Save, Settings2, MessageSquare, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { AvatarSystem } from '@/components/avatars/AvatarSystem';

const AVATARS = [
  { id: 'lotito', name: 'Lotito', description: 'Amigable y juvenil' },
  { id: 'orb', name: 'Orb', description: 'Asistente corporativo' },
  { id: 'cat', name: 'Mishi', description: 'Divertido y sarcástico' },
  { id: 'robot', name: 'Robo', description: 'Preciso y técnico' },
  { id: 'star', name: 'Star', description: 'Mágico y entusiasta' }
];

export function AiSettingsForm({
  tenantId,
  initialPrompt,
  initialAvatar,
  initialGroqApiKey
}: {
  tenantId: string;
  initialPrompt: string;
  initialAvatar: string;
  initialGroqApiKey: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [avatar, setAvatar] = useState(initialAvatar ?? 'lotito');
  const [groqApiKey, setGroqApiKey] = useState(initialGroqApiKey ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateAiSettings(tenantId, { ai_prompt: prompt, ai_avatar: avatar, groq_api_key: groqApiKey });
    setIsSaving(false);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("Error al guardar: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-black/20 p-8 rounded-3xl border border-white/5 shadow-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="text-gold-primary" size={24} />
            Identidad de la IA
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Personaliza el avatar visual y el prompt de base.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-10">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-white/60" />
            <h3 className="font-semibold text-foreground">System Prompt</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Este texto dicta el comportamiento central. <strong>Nota:</strong> No agregues las reglas de negocio aquí, usa la sección de "AI Control Center".
          </p>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-64 p-5 rounded-2xl bg-white/[0.02] border border-white/10 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all resize-none text-[15px] leading-relaxed text-foreground"
              placeholder="Ej: Eres el asistente experto de..."
            />
            <div className="absolute bottom-4 right-4 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity backdrop-blur-md">
              <Sparkles size={14} className="text-gold-primary" />
              <span className="text-xs font-semibold text-foreground">IA Activa</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-1">API Key de Groq (Opcional)</h3>
            <p className="text-xs text-muted-foreground mb-3">Si deseas usar tu propia API de inferencia Llama-3.</p>
            <input 
              type="password" 
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-primary focus:border-gold-primary transition-all text-[15px] text-foreground placeholder:text-white/20"
              placeholder="gsk_..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={18} className="text-white/60" />
            <h3 className="font-semibold text-foreground">Avatar Visual</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Elige la representación gráfica que verá el cliente.
          </p>
          
          <div className="grid gap-3">
            {AVATARS.map((a) => (
              <label 
                key={a.id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${avatar === a.id ? 'border-gold-primary bg-gold-primary/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                onClick={() => setAvatar(a.id)}
              >
                <input 
                  type="radio" 
                  name="avatar" 
                  value={a.id} 
                  checked={avatar === a.id}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="sr-only" 
                />
                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shrink-0 flex items-center justify-center bg-black shadow-sm">
                  <AvatarSystem variant={a.id as any} isActive={avatar === a.id} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-[15px]">{a.name}</h4>
                  <p className="text-[11px] text-muted-foreground font-medium">{a.description}</p>
                </div>
                {avatar === a.id && (
                  <div className="ml-auto">
                    <CheckCircle2 className="text-gold-primary" size={20} />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

      </div>

      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
          {showSuccess && (
            <span className="flex items-center gap-1.5 text-emerald-400 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={16} /> Guardado exitoso
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-gold-primary hover:bg-gold-light text-black px-8 py-3.5 rounded-full font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Aplicando...' : 'Guardar Identidad'}
        </button>
      </div>

    </form>
  );
}
