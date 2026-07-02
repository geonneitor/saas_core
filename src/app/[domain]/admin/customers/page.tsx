import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { User } from 'lucide-react';

export default async function CustomersPage(props: { params: Promise<{ domain: string }> }) {
  const { domain } = await props.params;
  const supabase = await createClient();

  // Obtenemos el tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', domain)
    .single();

  if (!tenant) notFound();

  // Obtenemos los clientes
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  // Lista de colores predefinidos para los avatares
  const colors = [
    'bg-red-100 text-red-600',
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-yellow-100 text-yellow-600',
    'bg-pink-100 text-pink-600',
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-neutral-500">Gestiona el directorio de tus clientes.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Teléfono</th>
              <th className="px-6 py-4 font-semibold">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers && customers.length > 0 ? (
              customers.map((customer, i) => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {/* Avatar visual genérico con silueta de Lucide */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[i % colors.length]}`}>
                      <User size={20} className="opacity-80" />
                    </div>
                    <span className="font-medium text-neutral-900">{customer.name}</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {customer.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                  No hay clientes registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
