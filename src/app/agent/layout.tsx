import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar el rol usando la tabla profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/'); // O a /hq si es super admin
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-lime-400 selection:text-black">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-lime-400 flex items-center justify-center font-bold text-black">
              A
            </div>
            <span className="font-mono text-xl tracking-tighter">Partner Portal</span>
          </div>
          <div className="text-sm font-mono text-zinc-400">
            {user.email}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
