'use client';

import { useState } from 'react';
import { X, Settings, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load AutoConfigWizard para no impactar el bundle inicial
const AutoConfigWizard = dynamic(
  () => import('@/components/tenant-ui/AutoConfigWizard').then(mod => ({ default: mod.AutoConfigWizard })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold-primary" />
      </div>
    ),
    ssr: false,
  }
);

interface ConfigureTenantModalProps {
  tenantId: string;
  tenantName: string;
}

export function ConfigureTenantModal({ tenantId, tenantName }: ConfigureTenantModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button — inline en la tabla */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110"
        style={{
          backgroundColor: 'var(--acid-neon)',
          color: 'var(--acid-bg)',
          border: '1px solid var(--acid-neon)',
        }}
        title={`Configurar ${tenantName}`}
      >
        <Settings size={12} />
        Configurar
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--acid-card)',
              borderColor: 'var(--acid-border)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/10"
              style={{ color: 'var(--acid-text-dim)' }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2
                className="text-xl font-bold flex items-center gap-2"
                style={{ color: 'var(--acid-neon)' }}
              >
                <Settings size={20} />
                Preconfigurar: {tenantName}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--acid-text-dim)' }}>
                Busca el negocio en Google Maps o ingresa los datos manualmente.
              </p>
            </div>

            {/* Wizard */}
            <AutoConfigWizard
              tenantId={tenantId}
              tenantName={tenantName}
              onComplete={() => {
                // El wizard ya maneja su propio timeout de 1.5s antes de llamar onComplete
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
