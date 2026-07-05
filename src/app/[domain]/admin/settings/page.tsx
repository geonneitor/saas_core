import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AiSettingsForm from '../AiSettingsForm';

export default async function SettingsPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const domain = params.domain;
  const supabase = await createClient();

  // Validar Inquilino y traer configuraciones
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
    <div className="p-8 pb-24 max-w-5xl mx-auto space-y-10">
      <main className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        <AiSettingsForm 
          tenantId={tenant.id} 
          initialPrompt={aiPrompt} 
          initialAvatar={aiAvatar} 
          initialGroqApiKey={settings?.groq_api_key || ''}
        />
      </main>
    </div>
  );
}
