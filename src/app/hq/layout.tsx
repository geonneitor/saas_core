import { ReactNode } from "react"
import { ShieldAlert, LogOut, LayoutDashboard, Settings } from "lucide-react"

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex">
      {/* Sidebar - Dark Luxury Vibe */}
      <aside className="w-64 border-r border-neutral-900 bg-neutral-950/50 backdrop-blur flex flex-col p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-neutral-900 rounded-lg text-emerald-500 ring-1 ring-white/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-sm tracking-widest text-white/90">SUPER ADMIN</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Geo-Dev Core</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <a href="/hq" className="flex items-center gap-3 text-sm px-4 py-2.5 bg-white/5 text-white rounded-md ring-1 ring-white/10 transition-all">
            <LayoutDashboard size={18} className="text-emerald-400" />
            Tenants
          </a>
          <a href="#" className="flex items-center gap-3 text-sm px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/5 rounded-md transition-all">
            <Settings size={16} />
            System Config
          </a>
        </nav>

        <div className="pt-6 border-t border-neutral-900">
          <a href="/login?logout=true" className="flex items-center gap-3 text-sm px-4 py-2 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all">
            <LogOut size={16} />
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
