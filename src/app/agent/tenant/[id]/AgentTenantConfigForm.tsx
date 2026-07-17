'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateTenantConfig } from './actions';
import { Loader2, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgentTenantConfigFormProps {
  tenantId: string;
  initialData: {
    ai_prompt: string;
    services_json: string;
    whatsapp_number: string;
    ai_tone: string;
  };
}

export function AgentTenantConfigForm({ tenantId, initialData }: AgentTenantConfigFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [aiPrompt, setAiPrompt] = useState(initialData.ai_prompt);
  const [servicesJson, setServicesJson] = useState(initialData.services_json);
  const [whatsappNumber, setWhatsappNumber] = useState(initialData.whatsapp_number);
  const [aiTone, setAiTone] = useState(initialData.ai_tone);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    // Validate JSON before sending
    try {
      JSON.parse(servicesJson);
    } catch {
      setMessage({ type: 'error', text: 'El JSON de servicios no es válido. Revisa la sintaxis.' });
      setIsSaving(false);
      return;
    }

    const result = await updateTenantConfig(tenantId, {
      ai_prompt: aiPrompt,
      services_json: servicesJson,
      whatsapp_number: whatsappNumber,
      ai_tone: aiTone,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al guardar la configuración.' });
    }

    setIsSaving(false);

    // Auto-clear success message after 3s
    if (result.success) {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Prompt */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-mono text-zinc-300">
          <Sparkles className="size-4 text-lime-400" />
          Prompt de la IA
        </label>
        <p className="text-xs text-zinc-500 font-mono">
          Define cómo se comportará el asistente virtual con los clientes.
        </p>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={4}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all resize-y"
          placeholder="Eres el asistente virtual experto de..."
        />
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-mono text-zinc-300">
          Tono de la IA
        </label>
        <select
          value={aiTone}
          onChange={(e) => setAiTone(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all"
        >
          <option value="Profesional y Amigable">Profesional y Amigable</option>
          <option value="Formal">Formal</option>
          <option value="Casual y Cercano">Casual y Cercano</option>
          <option value="Ejecutivo">Ejecutivo</option>
          <option value="Humorístico">Humorístico</option>
        </select>
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-mono text-zinc-300">
          Número de WhatsApp
        </label>
        <p className="text-xs text-zinc-500 font-mono">
          Los clientes serán redirigidos a este número para consultas.
        </p>
        <input
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all"
          placeholder="+521234567890"
        />
      </div>

      {/* Services JSON */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-mono text-zinc-300">
          Servicios (JSON)
        </label>
        <p className="text-xs text-zinc-500 font-mono">
          Define los servicios del negocio. Formato: {'[{ "name": "Corte", "price": 200, "duration": 30 }]'}
        </p>
        <textarea
          value={servicesJson}
          onChange={(e) => setServicesJson(e.target.value)}
          rows={8}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-green-400 placeholder:text-zinc-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all resize-y"
          placeholder='[{ "name": "Corte", "price": 200, "duration": 30 }]'
        />
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border text-sm font-mono ${
            message.type === 'success'
              ? 'bg-lime-500/10 border-lime-500/30 text-lime-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-lime-400 text-black hover:bg-lime-500 font-mono uppercase tracking-wider py-6 text-sm disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="size-5 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="size-5 mr-2" />
            Guardar Configuración
          </>
        )}
      </Button>
    </div>
  );
}
