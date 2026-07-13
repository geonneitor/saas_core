"use client";

export function DeleteTenantForm({ 
  tenantId, 
  tenantName, 
  action 
}: { 
  tenantId: string, 
  tenantName: string, 
  action: (formData: FormData) => Promise<void> 
}) {
  return (
    <form 
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar el tenant "${tenantName}"?\n\nEsta acción es IRREVERSIBLE y borrará todas las citas, clientes y configuraciones.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={tenantId} />
      <button 
        type="submit" 
        className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
      >
        Eliminar
      </button>
    </form>
  );
}
