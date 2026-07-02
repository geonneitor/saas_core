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

export default function AiSettingsForm({
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
  const [prompt, setPrompt] = useState(initialPrompt);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [groqApiKey, setGroqApiKey] = useState(initialGroqApiKey);
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
    <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings2 className="text-black" size={24} />
            Configuración del Asistente IA
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Personaliza cómo interactúa tu asistente con los clientes.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-10">
        
        {/* Left Column: Prompt */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-neutral-700" />
            <h3 className="font-semibold text-neutral-900">Personalidad y Reglas (System Prompt)</h3>
          </div>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Este texto dicta cómo se comporta tu asistente. Asegúrate de incluir tu tono de voz (formal, amigable) y reglas especiales. 
            <strong>Importante:</strong> Las herramientas de agenda funcionan automáticamente, no necesitas explicarlas aquí.
          </p>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-64 p-5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none text-[15px] leading-relaxed text-neutral-800"
              placeholder="Ej: Eres el asistente experto de..."
            />
            <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-neutral-600">IA Activa</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-neutral-900 mb-1">API Key de Groq (Opcional)</h3>
            <p className="text-xs text-neutral-500 mb-3">Si tienes tu propia cuenta de Groq, ingresa tu API Key aquí para no usar el límite global del sistema.</p>
            <input 
              type="password" 
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              className="w-full p-3.5 bg-[#F9FAFB] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-[15px]"
              placeholder="gsk_..."
            />
          </div>
        </div>

        {/* Right Column: Avatar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={18} className="text-neutral-700" />
            <h3 className="font-semibold text-neutral-900">Apariencia Visual (Avatar)</h3>
          </div>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Elige el avatar que aparecerá flotando en la pantalla de tus clientes.
          </p>
          
          <div className="grid gap-3">
            {AVATARS.map((a) => (
              <label 
                key={a.id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${avatar === a.id ? 'border-black bg-black/5' : 'border-neutral-100 hover:border-neutral-200 bg-white'}`}
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
                <div className="w-12 h-12 rounded-full border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center bg-white shadow-sm">
                  <AvatarSystem variant={a.id as any} isActive={avatar === a.id} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-[15px]">{a.name}</h4>
                  <p className="text-[11px] text-neutral-500 font-medium">{a.description}</p>
                </div>
                {avatar === a.id && (
                  <div className="ml-auto">
                    <CheckCircle2 className="text-black" size={20} />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
        <div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
          {showSuccess && (
            <span className="flex items-center gap-1.5 text-green-600 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={16} /> Cambios guardados
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-black hover:bg-neutral-800 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

    </form>
  );
}
