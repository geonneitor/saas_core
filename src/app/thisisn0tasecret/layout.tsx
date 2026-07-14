import { ReactNode } from "react"
import { ShieldAlert, LogOut, LayoutDashboard, Settings } from "lucide-react"
import { signOutAction } from "@/lib/auth/login-actions"

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundColor: 'var(--acid-bg)', 
        color: 'var(--acid-text)',
        fontFamily: 'var(--font-grotesk), sans-serif'
      }}
    >
      {/* Sidebar - Acid Brutalist */}
      <aside 
        className="w-64 border-r-2 flex flex-col p-6"
        style={{ 
          backgroundColor: 'var(--acid-card)', 
          borderColor: 'var(--acid-border)' 
        }}
      >
        <div className="flex items-center gap-3 mb-12">
          <div 
            className="p-2 rounded-md"
            style={{ 
              backgroundColor: 'var(--acid-bg)', 
              color: 'var(--acid-neon)',
              border: '2px solid var(--acid-neon)',
              boxShadow: '0 0 12px rgba(193, 255, 0, 0.3)'
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 
              className="font-bold text-sm tracking-widest"
              style={{ color: 'var(--acid-text)' }}
            >
              SUPER ADMIN
            </h2>
            <p 
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--acid-text-dim)' }}
            >
              Geo-Dev Core
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <a 
            href="/thisisn0tasecret" 
            className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-md transition-all"
            style={{ 
              backgroundColor: 'var(--acid-bg)',
              color: 'var(--acid-neon)',
              border: '1px solid var(--acid-neon)'
            }}
          >
            <LayoutDashboard size={18} />
            Tenants
          </a>
          <a
            href="/thisisn0tasecret#config"
            className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-md transition-all"
            style={{ color: 'var(--acid-text-dim)' }}
          >
            <Settings size={16} />
            System Config
          </a>
        </nav>

        <div
          className="pt-6"
          style={{ borderTop: '2px solid var(--acid-border)' }}
        >
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 text-sm px-4 py-2 rounded-md transition-all w-full text-left cursor-pointer"
              style={{ color: 'var(--acid-danger)' }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
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