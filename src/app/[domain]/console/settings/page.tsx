import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Settings, ShieldAlert } from 'lucide-react';
import { AiSettingsForm } from '@/components/tenant-ui/console/AiSettingsForm';

export default async function SettingsPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const domain = params.domain;
  
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, business_settings(*)')
    .eq('subdomain', domain)
    .single();

  if (!tenant || !tenant.is_active) {
    notFound();
  }

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
    
  const aiPrompt = settings?.ai_prompt || '';
  const aiAvatar = settings?.ai_avatar || 'lotito';

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gold-primary" />
          </div>
          <h1 className="text-3xl font-serif">Configuración General</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Ajustes de identidad del asistente y controles de supervisión humana.
        </p>
      </header>

      <AiSettingsForm 
        tenantId={tenant.id} 
        initialPrompt={aiPrompt} 
        initialAvatar={aiAvatar} 
        initialGroqApiKey={settings?.groq_api_key || ''}
      />

      <section className="zen-card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Modo Supervisor (Kill-Switch)</h2>
            <p className="text-sm text-muted-foreground">Toma el control manual de las conversaciones de WhatsApp.</p>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-6">
          <div>
            <h3 className="text-foreground font-medium mb-1">Pausar Asistente Automático</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Al activar esto, la IA dejará de responder a los clientes. Útil cuando necesitas manejar un caso de soporte delicado directamente desde tu WhatsApp Business.
            </p>
          </div>
          <button className="px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-colors shrink-0 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            IA Activa
          </button>
        </div>
      </section>

    </div>
  );
}
