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
      <button type="submit" className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md text-xs font-semibold border border-red-200 transition-colors">
        Eliminar
      </button>
    </form>
  );
}
