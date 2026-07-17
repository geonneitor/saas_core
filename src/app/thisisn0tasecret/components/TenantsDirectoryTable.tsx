import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import MapModal from "../MapModal"
import { UpdateTokenLimitForm } from "./UpdateTokenLimitForm"
import { DeleteTenantForm } from "./DeleteTenantForm"
import { ConfigureTenantModal } from "./ConfigureTenantModal"
import { deleteTenant } from "../actions"
import { AssignAgentForm } from "./AssignAgentForm"

interface TenantsDirectoryTableProps {
  // [16726] Tipos estrictos (Sprint 3.3)
  tenants: {
    id: string;
    name: string;
    subdomain: string;
    is_active: boolean;
    ai_token_limit?: number;
    ai_tokens_used?: number;
    agent_id?: string | null;
    business_settings?: { whatsapp_number?: string; latitude?: number; longitude?: number }[];
  }[];
  mapsApiKey: string;
  agents?: { id: string; email?: string }[];
}

export function TenantsDirectoryTable({ tenants, mapsApiKey, agents }: TenantsDirectoryTableProps) {
  return (
    <Card 
      className="border-brutal rounded-none"
      style={{ backgroundColor: 'var(--acid-card)' }}
    >
      <CardHeader>
        <CardTitle style={{ color: 'var(--acid-text)' }}>Directorio de Negocios (Tenants)</CardTitle>
        <CardDescription style={{ color: 'var(--acid-text-dim)' }}>
          Administra accesos, revisa consumos y mapea a tus clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow 
              className="hover:bg-transparent"
              style={{ backgroundColor: 'var(--acid-bg)' }}
            >
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Negocio</TableHead>
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Estado</TableHead>
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Consumo IA</TableHead>
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Contacto</TableHead>
              <TableHead className="uppercase text-[10px] tracking-widest text-right" style={{ color: 'var(--acid-text-dim)' }}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants?.map((tenant) => {
              const settings = tenant.business_settings?.[0];
              const usagePercent = tenant.ai_token_limit 
                ? Math.round(((tenant.ai_tokens_used || 0) / tenant.ai_token_limit) * 100) 
                : 0;
              
              return (
                <TableRow 
                  key={tenant.id} 
                  className="transition-colors border-b-0 hover:border-l-2 hover:bg-[var(--acid-bg)] hover:border-l-[var(--acid-neon)]"
                  style={{ borderBottom: '1px solid var(--acid-border)' }}
                >
                  <TableCell>
                    <div className="font-bold" style={{ color: 'var(--acid-text)' }}>{tenant.name}</div>
                    <a href={`https://${tenant.subdomain}.geo-dev.online`} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color: 'var(--acid-neon-dim)' }}>
                      {tenant.subdomain}.geo-dev.online
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className="border-brutal"
                      style={{ 
                        color: tenant.is_active ? 'var(--acid-neon)' : 'var(--acid-text-dim)',
                        backgroundColor: 'var(--acid-bg)'
                      }}
                    >
                      {tenant.is_active ? 'Activo' : 'Suspendido'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-full rounded-none h-2 max-w-[100px]" style={{ backgroundColor: 'var(--acid-bg)', border: '1px solid var(--acid-border)' }}>
                        <div 
                          className="h-full" 
                          style={{ 
                            backgroundColor: usagePercent > 80 ? 'var(--acid-danger)' : 'var(--acid-neon)',
                            width: `${Math.min(usagePercent, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--acid-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>{usagePercent}%</span>
                    </div>
                    <div className="text-[10px] mt-1 mb-2" style={{ color: 'var(--acid-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>
                      {tenant.ai_tokens_used || 0} / {tenant.ai_token_limit || 0}
                    </div>
                    <UpdateTokenLimitForm tenantId={tenant.id} currentLimit={tenant.ai_token_limit || 0} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {settings?.whatsapp_number && (
                        <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" title="Contactar WhatsApp">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none border-brutal hover:border-brutal-hover" style={{ backgroundColor: 'var(--acid-bg)', color: 'var(--acid-neon)' }}>
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
                    <div className="mt-2">
                      <AssignAgentForm tenantId={tenant.id} currentAgentId={tenant.agent_id} agents={agents} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ConfigureTenantModal tenantId={tenant.id} tenantName={tenant.name} />
                      <DeleteTenantForm tenantId={tenant.id} tenantName={tenant.name} action={deleteTenant} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            
            {tenants?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8" style={{ color: 'var(--acid-text-dim)' }}>
                  No hay inquilinos registrados aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
