import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AiSettingsForm from '../AiSettingsForm';
import WalletDashboard from '@/components/admin/WalletDashboard';
import { Settings, ShieldAlert, Wallet } from 'lucide-react';

export default async function SettingsPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const domain = params.domain;
  const currentTab = searchParams.tab || 'ai';
  
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

  const tabs = [
    { id: 'ai', label: 'Asistente IA', icon: Settings },
    { id: 'supervisor', label: 'Modo Supervisor', icon: ShieldAlert },
    { id: 'wallet', label: 'Billetera Virtual', icon: Wallet },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-foreground tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu asistente inteligente y saldo de prepago.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-px">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/settings?tab=${tab.id}`}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                isActive 
                  ? 'border-gold-primary text-gold-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {currentTab === 'ai' && (
          <div className="card-depth rounded-3xl p-8 border border-white/[0.06]">
            <AiSettingsForm 
              tenantId={tenant.id} 
              initialPrompt={aiPrompt} 
              initialAvatar={aiAvatar} 
              initialGroqApiKey={settings?.groq_api_key || ''}
            />
          </div>
        )}

        {currentTab === 'supervisor' && (
          <div className="card-depth rounded-3xl p-8 border border-white/[0.06] space-y-6">
            <div>
              <h2 className="text-xl font-serif text-foreground">Modo Supervisor</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Toma el control manual de las conversaciones de WhatsApp en cualquier momento.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-6">
              <div>
                <h3 className="text-foreground font-medium mb-2">Pausar Asistente Automático</h3>
                <p className="text-sm text-muted-foreground">
                  Al activar esto, la IA dejará de responder automáticamente a los clientes. Útil cuando necesitas manejar un caso especial o queja directamente.
                </p>
              </div>
              <button className="px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-colors shrink-0">
                IA Activa
              </button>
            </div>
          </div>
        )}

        {currentTab === 'wallet' && (
          <WalletDashboard 
            tokensUsed={settings?.ai_tokens_used || 0}
            tokensLimit={settings?.ai_tokens_limit || 0}
            tenantId={tenant.id}
            hasPromo={tenant.setup_advance_paid && !tenant.setup_fee_paid}
          />
        )}
      </div>
    </div>
  );
}
