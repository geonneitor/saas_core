import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, Users, Activity, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AiSettingsForm from './AiSettingsForm';

export default async function AdminDashboard(props: { params: Promise<{ domain: string }> }) {
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

  // Traer métricas (ej. cantidad de citas)
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);
    
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  const settings = Array.isArray(tenant.business_settings) 
    ? tenant.business_settings[0] 
    : tenant.business_settings;
  const aiPrompt = settings?.ai_prompt || '';
  const aiAvatar = settings?.ai_avatar || 'lotito';

  return (
    <div className="p-8 pb-24 max-w-5xl space-y-10">

      <main className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        
        {/* Resumen / KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/calendar" className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center justify-between gap-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Calendar size={24} className="stroke-[2.5px]" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Citas Agendadas</p>
                <h3 className="text-3xl font-black mt-1">{totalAppointments || 0}</h3>
              </div>
            </div>
            <ArrowRight className="text-neutral-300 group-hover:text-blue-500 transition-colors" />
          </Link>
          
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <Users size={24} className="stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Clientes Únicos</p>
              <h3 className="text-3xl font-black mt-1">{totalCustomers || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Activity size={24} className="stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Estado IA</p>
              <h3 className="text-2xl font-black mt-1 text-green-500 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> Activa
              </h3>
            </div>
          </div>
        </div>

        {/* Sección de Configuración IA */}
        <section id="configuracion" className="scroll-mt-24">
          <AiSettingsForm 
            tenantId={tenant.id} 
            initialPrompt={aiPrompt} 
            initialAvatar={aiAvatar} 
            initialGroqApiKey={settings?.groq_api_key || ''}
          />
        </section>

      </main>
    </div>
  );
}
