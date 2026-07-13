'use client';

import { useState } from 'react';
import { updateTokenLimit } from '../actions';
import { Zap, Loader2, Check } from 'lucide-react';

export function UpdateTokenLimitForm({ tenantId, currentLimit }: { tenantId: string, currentLimit: number }) {
  const [limit, setLimit] = useState(currentLimit || 0);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = async () => {
    setIsPending(true);
    setIsSuccess(false);
    
    const formData = new FormData();
    formData.append('id', tenantId);
    formData.append('limit', limit.toString());
    
    await updateTokenLimit(formData);
    
    setIsPending(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1 max-w-[170px]">
      <div className="pl-1.5">
        <Zap className="w-3 h-3 text-emerald-400" />
      </div>
      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="w-16 bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 p-0.5 font-mono"
        title="Límite de Tokens (IA)"
      />
      <button
        onClick={handleUpdate}
        disabled={isPending || limit === currentLimit}
        className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center min-w-[40px] cursor-pointer"
      >
        {isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : (isSuccess ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : 'SAVE')}
      </button>
    </div>
  );
}
