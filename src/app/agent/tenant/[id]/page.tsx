import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, Zap, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { AgentTenantConfigForm } from './AgentTenantConfigForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentTenantConfigPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify agent owns this tenant (RLS will filter)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, business_settings(*)')
    .eq('id', id)
    .single();

  if (!tenant) {
    notFound();
  }

  const settings = (tenant as any).business_settings?.[0] || (tenant as any).business_settings || {};

  const defaultServices = JSON.stringify(
    [{ name: 'Ejemplo Servicio', price: 0, duration: 30 }],
    null,
    2
  );

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/agent"
        className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-lime-400 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver al panel
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-sm bg-lime-400 flex items-center justify-center font-bold text-black">
            <Wrench className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-mono tracking-tighter uppercase text-lime-400">
              {tenant.name}
            </h1>
            <p className="text-sm font-mono text-zinc-500">
              {tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'geo-dev.online'}
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Configura rápidamente los datos de este cliente. Los cambios se reflejarán al instante.
        </p>
      </div>

      {/* Configuration Form */}
      <Card className="border-white/10 bg-zinc-950">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <Zap className="size-5 text-lime-400" />
            Configuración Rápida
          </CardTitle>
          <CardDescription className="font-mono text-xs text-zinc-500">
            Define el prompt de IA, los servicios, y el número de WhatsApp del negocio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentTenantConfigForm
            tenantId={tenant.id}
            initialData={{
              ai_prompt: settings.ai_prompt || '',
              services_json: settings.services_json
                ? JSON.stringify(settings.services_json, null, 2)
                : defaultServices,
              whatsapp_number: settings.whatsapp_number || '',
              ai_tone: settings.ai_tone || 'Profesional y Amigable',
            }}
          />
        </CardContent>
      </Card>

      {/* Preview Info */}
      <Card className="border-white/10 bg-zinc-950/50">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm flex items-center gap-2 text-zinc-300">
            <Smartphone className="size-4 text-zinc-500" />
            Vista Previa del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-zinc-500">Link de la landing</span>
            <span className="font-mono text-lime-400 text-xs">
              https://{tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'geo-dev.online'}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-zinc-500">WhatsApp configurado</span>
            <span className="font-mono text-xs">
              {settings.whatsapp_number ? (
                <Badge variant="outline" className="border-lime-500/30 text-lime-400">
                  {settings.whatsapp_number}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  Pendiente
                </Badge>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-zinc-500">Servicios configurados</span>
            <span className="font-mono text-xs">
              {settings.services_json ? (
                <Badge variant="outline" className="border-lime-500/30 text-lime-400">
                  {Array.isArray(settings.services_json)
                    ? `${settings.services_json.length} servicios`
                    : 'Configurado'}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  Sin servicios
                </Badge>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
