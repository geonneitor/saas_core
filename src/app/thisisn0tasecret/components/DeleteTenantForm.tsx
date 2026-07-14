"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DeleteTenantForm({ 
  tenantId, 
  tenantName, 
  action 
}: { 
  tenantId: string, 
  tenantName: string, 
  action: (formData: FormData) => Promise<void> 
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (formData: FormData) => {
    setIsPending(true);
    await action(formData);
    setIsPending(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Base UI DialogTrigger uses render prop, no asChild */}
      <DialogTrigger
        render={
          <button
            className="px-3 py-1.5 text-xs font-semibold rounded-none transition-all cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--acid-danger)',
              border: '2px solid var(--acid-danger)'
            }}
          >
            Eliminar
          </button>
        }
      />
      <DialogContent 
        className="rounded-none border-brutal"
        style={{ 
          backgroundColor: 'var(--acid-card)', 
          color: 'var(--acid-text)'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--acid-danger)' }}>
            ¿Eliminar tenant?
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--acid-text-dim)' }}>
            Vas a eliminar <strong>{tenantName}</strong>. Esta acción es irreversible
            y borrará todas las citas, clientes y configuraciones.
          </DialogDescription>
        </DialogHeader>
        <form action={handleDelete}>
          <input type="hidden" name="id" value={tenantId} />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-none border-brutal"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--acid-text-dim)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-bold rounded-none"
              style={{
                backgroundColor: 'var(--acid-danger)',
                color: 'white'
              }}
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
