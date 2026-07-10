import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, MessageCircle, MapPin } from "lucide-react"

import MapModal from "./MapModal"

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalTenants}</div>
            <p className="text-xs text-emerald-500 mt-1">{activeTenants} activos actualmente</p>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Consumo Global de IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalTokensUsed.toLocaleString()}</div>
            <p className="text-xs text-neutral-500 mt-1">Tokens Groq procesados</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Salud del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">100%</div>
            <p className="text-xs text-neutral-500 mt-1">Sistemas operando normalmente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Directorio de Negocios (Tenants)</CardTitle>
          <CardDescription className="text-neutral-400">
            Administra accesos, revisa consumos y mapea a tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-neutral-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-neutral-400">Negocio</TableHead>
                <TableHead className="text-neutral-400">Estado</TableHead>
                <TableHead className="text-neutral-400">Consumo IA</TableHead>
                <TableHead className="text-neutral-400">Contacto</TableHead>
                <TableHead className="text-right text-neutral-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants?.map((tenant) => {
                const settings = tenant.business_settings?.[0];
                const usagePercent = settings && settings.ai_tokens_limit 
                  ? Math.round((settings.ai_tokens_used / settings.ai_tokens_limit) * 100) 
                  : 0;
                
                return (
                  <TableRow key={tenant.id} className="border-neutral-800 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="font-medium text-white">{tenant.name}</div>
                      <a href={`https://${tenant.subdomain}.geo-dev.online`} target="_blank" rel="noreferrer" className="text-xs text-emerald-500 hover:underline">
                        {tenant.subdomain}.geo-dev.online
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.is_active ? "default" : "destructive"} className={tenant.is_active ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
                        {tenant.is_active ? 'Activo' : 'Suspendido'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-neutral-800 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${usagePercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400">{usagePercent}%</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        {settings?.ai_tokens_used || 0} / {settings?.ai_tokens_limit || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {settings?.whatsapp_number && (
                          <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" title="Contactar WhatsApp">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-full">
                              <MessageCircle size={14} />
                            </Button>
                          </a>
                        )}
                        {settings?.latitude && settings?.longitude && (
                          <MapModal 
                            latitude={settings.latitude} 
                            longitude={settings.longitude} 
                            apiKey={mapsApiKey} 
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="border-neutral-700 bg-transparent hover:bg-neutral-800 text-white">
                        Administrar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {tenants?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                    No hay inquilinos registrados aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
