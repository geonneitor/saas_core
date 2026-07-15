import { createClient } from '@/lib/supabase/server';
import { BrainCircuit, MessageSquareText, ShieldAlert, Sparkles, Plus } from 'lucide-react';
import { ToneSelector } from '@/components/tenant-ui/console/ToneSelector';
import { ServicesManager } from '@/components/tenant-ui/console/ServicesManager';
import { BusinessRulesManager } from '@/components/tenant-ui/console/BusinessRulesManager';

export default async function AITrainingPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  // Fetch tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, business_settings(*)')
    .eq('subdomain', params.domain)
    .single();

  if (!tenant) return <div>Inquilino no encontrado</div>;

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
    
  const currentTone = settings?.ai_tone || 'vip';
  const aiPrompt = settings?.ai_prompt || '';

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-gold-primary" />
          </div>
          <h1 className="text-3xl font-serif">AI Control Center</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Configura cómo piensa, habla y actúa tu asistente virtual. Toda esta información será utilizada por la IA para atender a tus clientes de manera autónoma.
        </p>
      </header>

      {/* Tone & Personality */}
      <section className="zen-card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1">
            <MessageSquareText className="w-5 h-5 text-white/50" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Personalidad y Tono</h2>
            <p className="text-sm text-muted-foreground">¿Cómo quieres que el asistente se dirija a tus clientes?</p>
          </div>
        </div>
        
        <ToneSelector tenantId={tenant.id} currentTone={currentTone} />
      </section>

      {/* Services & Pricing */}
      <section className="zen-card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Sparkles className="w-5 h-5 text-gold-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Catálogo de Servicios</h2>
              <p className="text-sm text-muted-foreground">La IA usará esto para responder preguntas de precios y agendar.</p>
            </div>
          </div>
        </div>

        <ServicesManager tenantId={tenant.id} initialServices={settings?.services_json || []} />
      </section>

      {/* Strict Business Rules */}
      <section className="zen-card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Reglas Estrictas (Guardrails)</h2>
            <p className="text-sm text-muted-foreground">Instrucciones críticas que la IA no puede romper bajo ninguna circunstancia.</p>
          </div>
        </div>
        
        <BusinessRulesManager tenantId={tenant.id} currentRules={settings?.ai_rules || ''} />
      </section>
      
    </div>
  );
}
