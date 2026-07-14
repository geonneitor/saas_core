'use client';

import { Plus, Sparkles } from 'lucide-react';
import { createTenant } from '../actions';

export function CreateTenantForm({ domain }: { domain: string }) {
  return (
    <div 
      className="border-brutal rounded-none p-8"
      style={{ backgroundColor: 'var(--acid-card)' }}
    >
      <div 
        className="w-10 h-10 rounded-none flex items-center justify-center mb-6"
        style={{ 
          backgroundColor: 'var(--acid-bg)', 
          border: '2px solid var(--acid-neon)',
          boxShadow: '0 0 12px rgba(193, 255, 0, 0.3)'
        }}
      >
        <Plus className="w-5 h-5" style={{ color: 'var(--acid-neon)' }} />
      </div>
      <h2 className="text-2xl font-bold mb-2 uppercase" style={{ color: 'var(--acid-text)' }}>Desplegar Inquilino</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--acid-text-dim)' }}>Provisiona un nuevo entorno aislado (Tenant) con 1000 tokens iniciales.</p>

      <form action={createTenant} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold block" style={{ color: 'var(--acid-text-dim)' }}>Nombre Comercial</label>
          <input 
            type="text" 
            name="name" 
            required 
            autoComplete="off"
            className="w-full rounded-none px-4 py-3 text-sm transition-all focus:outline-none border-brutal focus:border-[var(--acid-neon)] focus:ring-0"
            style={{ 
              backgroundColor: 'var(--acid-bg)', 
              color: 'var(--acid-text)',
            }}
            placeholder="Ej: Barbería The King" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold block" style={{ color: 'var(--acid-text-dim)' }}>Subdominio Único</label>
          <div className="flex items-stretch">
            <input 
              type="text" 
              name="subdomain" 
              required 
              autoComplete="off"
              className="w-full rounded-none px-4 py-3 text-sm transition-all focus:outline-none border-brutal border-r-0 focus:border-[var(--acid-neon)] focus:ring-0"
              style={{ 
                backgroundColor: 'var(--acid-bg)', 
                color: 'var(--acid-text)',
              }}
              placeholder="theking" 
            />
            <div 
              className="border-brutal px-4 flex items-center text-xs font-mono"
              style={{ 
                backgroundColor: 'var(--acid-card)',
                color: 'var(--acid-text-dim)',
                fontFamily: 'var(--font-geist-mono)'
              }}
            >
              .{domain}
            </div>
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full mt-4 px-6 py-4 rounded-none font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border-none"
          style={{
            backgroundColor: 'var(--acid-neon)',
            color: 'var(--acid-bg)',
            boxShadow: '0 0 12px rgba(193, 255, 0, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(193, 255, 0, 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(193, 255, 0, 0.3)'}
        >
          <Sparkles className="w-4 h-4" />
          Crear y Provisionar
        </button>
      </form>
    </div>
  );
}
