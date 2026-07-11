import { createAdminClient } from "@/lib/supabase/admin"
import { GlobalMetricsCards } from "./components/GlobalMetricsCards"
import { TenantsDirectoryTable } from "./components/TenantsDirectoryTable"

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const supabaseAdmin = createAdminClient();
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Fetch all tenants with their business settings
  const { data: tenants, error } = await supabaseAdmin
    .from('tenants')
    .select(`
      *,
      business_settings (
        ai_tokens_limit,
        ai_tokens_used,
        latitude,
        longitude,
        whatsapp_number
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-500">Error cargando inquilinos: {error.message}</div>
  }

  // Calculate some aggregate metrics
  const totalTenants = tenants?.length || 0;
  const activeTenants = tenants?.filter(t => t.is_active).length || 0;
  const totalTokensUsed = tenants?.reduce((acc, t) => acc + (t.business_settings?.[0]?.ai_tokens_used || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Central</h1>
        <p className="text-neutral-400 mt-1">Supervisión y métricas de todos los tenants activos.</p>
      </div>

      {/* Top Metrics */}
      <GlobalMetricsCards 
        totalTenants={totalTenants} 
        activeTenants={activeTenants} 
        totalTokensUsed={totalTokensUsed} 
      />

      {/* Tenants Table */}
      <TenantsDirectoryTable 
        tenants={tenants || []} 
        mapsApiKey={mapsApiKey} 
      />
    </div>
  )
}
