import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { User, Users, Clock, Search } from 'lucide-react';

export default async function ConsoleCustomersPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { domain } = await props.params;
  const { q } = await props.searchParams;
  const searchQuery = (q || '').trim();
  
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', domain)
    .single();

  if (!tenant) notFound();

  let query = supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenant.id);

  // Server-side filtering by name or phone
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
  }

  const { data: customers } = await query
    .order('created_at', { ascending: false });

  const colors = [
    'bg-gold-primary/20 text-gold-primary border border-gold-primary/30',
    'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-gold-primary" />
            </div>
            <h1 className="text-3xl font-serif">Directorio de Clientes</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Gestión de pacientes, comensales o visitantes que han interactuado con la IA o agendado citas.
          </p>
        </div>
        
        {/* Functional search via GET form — submit con Enter o click en el Search icon */}
        <form method="GET" className="relative">
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 p-0 border-none bg-transparent cursor-pointer">
            <Search className="w-4 h-4 text-white/40 hover:text-white/80 transition-colors" />
          </button>
          <input 
            name="q"
            type="text" 
            defaultValue={searchQuery}
            placeholder="Buscar por nombre o teléfono..." 
            className="w-full md:w-64 pl-10 pr-8 py-2 bg-black/40 border border-white/10 rounded-full text-sm focus:outline-none focus:border-gold-primary/50 transition-colors"
          />
          {searchQuery && (
            <a
              href="/console/customers"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition-colors"
              title="Limpiar búsqueda"
            >
              ✕
            </a>
          )}
        </form>
      </header>

      {searchQuery && (
        <p className="text-xs text-muted-foreground">
          Resultados para &ldquo;{searchQuery}&rdquo; — {customers?.length || 0} cliente{customers?.length !== 1 ? 's' : ''} encontrado{customers?.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="zen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase tracking-widest text-[10px] font-bold">
              <tr>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Teléfono (WhatsApp)</th>
                <th className="px-8 py-5">Primera Interacción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers && customers.length > 0 ? (
                customers.map((customer, i) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${colors[i % colors.length]}`}>
                        <span className="font-bold text-sm">
                          {customer.name ? customer.name.substring(0,2).toUpperCase() : <User size={18} />}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-white block">{customer.name || 'Desconocido'}</span>
                        {customer.email && <span className="text-xs text-white/40">{customer.email}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-white/70 font-mono text-xs bg-white/5 px-2 py-1 rounded-md">
                        {customer.phone || 'Sin registro'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(customer.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center text-white/30">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">
                      {searchQuery ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados aún.'}
                    </p>
                    <p className="text-xs mt-1">
                      {searchQuery 
                        ? 'Intenta con otro nombre o número de teléfono.' 
                        : 'La IA registrará automáticamente a las personas que agenden.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
