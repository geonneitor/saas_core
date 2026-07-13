'use client';

import { Plus, Sparkles } from 'lucide-react';
import { createTenant } from '../actions';

export function CreateTenantForm({ domain }: { domain: string }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 backdrop-blur-md">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
        <Plus className="w-5 h-5 text-emerald-400" />
      </div>
      <h2 className="font-serif text-2xl text-white mb-2">Desplegar Inquilino</h2>
      <p className="text-sm text-neutral-400 mb-8">Provisiona un nuevo entorno aislado (Tenant) con 1000 tokens iniciales.</p>

      <form action={createTenant} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">Nombre Comercial</label>
          <input 
            type="text" 
            name="name" 
            required 
            autoComplete="off"
            className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20" 
            placeholder="Ej: Barbería The King" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">Subdominio Único</label>
          <div className="flex items-stretch">
            <input 
              type="text" 
              name="subdomain" 
              required 
              autoComplete="off"
              className="w-full bg-black/50 border border-neutral-800 border-r-0 rounded-l-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20" 
              placeholder="theking" 
            />
            <div className="bg-neutral-800 border border-neutral-800 rounded-r-xl px-4 flex items-center text-xs text-neutral-400 font-mono">
              .{domain}
            </div>
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/10"
        >
          <Sparkles className="w-4 h-4" />
          Crear y Provisionar
        </button>
      </form>
    </div>
  );
}
