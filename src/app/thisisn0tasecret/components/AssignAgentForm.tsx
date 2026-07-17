'use client';

import { useTransition } from "react"
import { assignAgentToTenant } from "../actions"
import { toast } from "sonner"

interface AssignAgentFormProps {
  tenantId: string;
  currentAgentId?: string | null;
  agents?: { id: string; email?: string }[];
}

export function AssignAgentForm({ tenantId, currentAgentId, agents }: AssignAgentFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    const newAgentId = e.target.value;
    startTransition(async () => {
      const formData = new FormData();
      formData.append('tenantId', tenantId);
      formData.append('agentId', newAgentId === 'none' ? '' : newAgentId);
      
      const res = await assignAgentToTenant(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Agente asignado exitosamente");
      }
    });
  }

  return (
    <div className="w-[140px]">
      <select 
        defaultValue={currentAgentId || 'none'} 
        onChange={handleAssign}
        disabled={isPending}
        className="w-full h-7 text-[10px] bg-black/50 border border-white/20 font-mono text-white rounded outline-none px-2 cursor-pointer"
      >
        <option value="none" className="text-zinc-500 bg-zinc-950">Sin agente</option>
        {agents?.map(a => (
          <option key={a.id} value={a.id} className="bg-zinc-950 text-white">
            {a.email || a.id.slice(0, 8)}
          </option>
        ))}
      </select>
    </div>
  )
}
