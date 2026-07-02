// En Next.js App Router los parámetros dinámicos como [domain] se inyectan como props.
export default async function TenantPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params;

  // TODO: Aquí haremos una consulta a Supabase para buscar los datos del Tenant (Colores, Logo, Nombre) basado en el dominio
  // const tenant = await getTenantByDomain(domain);
  // if (!tenant) return notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-white text-black">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold">
          Bienvenido a <span className="text-blue-600 capitalize">{domain.split('.')[0]}</span>
        </h1>
        <p className="text-zinc-600">
          Esta es la página de reservas en línea. Próximamente aquí estará el calendario interactivo.
        </p>
        
        <div className="bg-zinc-100 p-6 rounded-2xl shadow-sm border border-zinc-200">
          <p className="font-mono text-sm text-zinc-500">
            [Módulo de Calendario irá aquí]
          </p>
        </div>
      </div>
    </div>
  );
}
