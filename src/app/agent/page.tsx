import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { StripeConnectButton } from './StripeConnectButton';

export default async function AgentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Cargar datos del perfil del agente
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Cargar inquilinos que pertenecen a este agente
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, business_settings(whatsapp_number, ai_prompt)')
    .eq('agent_id', user.id);

  const needsStripeOnboarding = !profile?.stripe_onboarding_complete;

  return (
    <div className="space-y-6">
      {needsStripeOnboarding && (
        <Card className="border-red-500/50 bg-red-500/10 text-red-200">
          <CardHeader className="pb-3 flex flex-row items-center gap-4 space-y-0">
            <AlertCircle className="size-8 text-red-500" />
            <div>
              <CardTitle className="text-red-400">Configuración Bancaria Pendiente</CardTitle>
              <CardDescription className="text-red-300">
                Debes vincular tu cuenta bancaria para recibir tus comisiones recurrentes (25%) de forma automática.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <StripeConnectButton />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono tracking-tighter uppercase text-lime-400">Mis Clientes</h1>
          <p className="text-zinc-400">Gestiona los inquilinos que has capturado.</p>
        </div>
        <Button className="bg-lime-400 text-black hover:bg-lime-500 font-mono uppercase">
          <Plus className="mr-2 size-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants?.map((tenant) => (
          <Card key={tenant.id} className="border-white/10 bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-lg font-mono truncate">{tenant.name}</CardTitle>
              <CardDescription className="font-mono text-xs">{tenant.subdomain}.tu-dominio.com</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Estado</span>
                <span className="text-lime-400">Activo</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                <Link href={`/agent/tenant/${tenant.id}`}>
                  <Button variant="outline" size="sm" className="font-mono">
                    Configurar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!tenants || tenants.length === 0) && (
          <div className="col-span-full py-12 text-center text-zinc-500 font-mono border border-dashed border-zinc-800 rounded-lg">
            No tienes clientes asignados todavía.
          </div>
        )}
      </div>
    </div>
  );
}
