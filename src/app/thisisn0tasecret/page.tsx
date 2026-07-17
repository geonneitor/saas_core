import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from '@/lib/auth/super-admin';
import { GlobalMetricsCards } from "./components/GlobalMetricsCards"
import { TenantsDirectoryTable } from "./components/TenantsDirectoryTable"
import { CreateTenantForm } from "./components/CreateTenantForm"
import { AgentsDirectoryTable } from "./components/AgentsDirectoryTable"

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <div className="text-red-500 p-8">Acceso denegado. Por favor inicia sesión.</div>;
  
  if (!(await isSuperAdmin(supabase, user.id)) && process.env.NODE_ENV !== 'development') {
    return <div className="text-red-500 p-8">No autorizado. Nivel de acceso insuficiente.</div>;
  }

  const supabaseAdmin = createAdminClient();
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Fetch all tenants with their business settings
  const { data: tenants, error } = await supabaseAdmin
    .from('tenants')
    .select(`
      id,
      name,
      subdomain,
      is_active,
      ai_token_limit,
      ai_tokens_used,
      created_at,
      agent_id,
      business_settings (
        latitude,
        longitude,
        whatsapp_number
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-500">Error cargando inquilinos: {error.message}</div>
  }

  // Fetch agents data
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'agent');

  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
  
  const agents = (profiles || []).map(profile => {
    const authUser = usersData?.users.find(u => u.id === profile.id);
    const tenantCount = tenants?.filter(t => t.agent_id === profile.id).length || 0;
    return {
      id: profile.id,
      role: profile.role,
      email: authUser?.email,
      stripe_onboarding_complete: (profile as any).stripe_onboarding_complete,
      tenantCount
    };
  });

  // Calculate some aggregate metrics
  const totalTenants = tenants?.length || 0;
  const activeTenants = tenants?.filter(t => t.is_active).length || 0;
  const totalTokensUsed = tenants?.reduce((acc, t) => acc + (t.ai_tokens_used || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Central</h1>
        <p className="text-neutral-400 mt-1">Supervisión y métricas de todos los tenants activos y agentes.</p>
      </div>

      {/* Top Metrics */}
      <GlobalMetricsCards 
        totalTenants={totalTenants} 
        activeTenants={activeTenants} 
        totalTokensUsed={totalTokensUsed} 
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tenants & Agents Table (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <TenantsDirectoryTable 
            tenants={tenants || []} 
            mapsApiKey={mapsApiKey}
            agents={agents}
          />
          <AgentsDirectoryTable agents={agents} />
        </div>

        {/* Deploy Form (Right 1 col) */}
        <div className="lg:col-span-1">
          <CreateTenantForm domain={domain} />
        </div>
      </div>
    </div>
  )
}

