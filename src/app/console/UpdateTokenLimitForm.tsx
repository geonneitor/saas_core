'use client';

import { useState } from 'react';
import { updateTokenLimit } from './actions';
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
    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-1">
      <div className="pl-2">
        <Zap className="w-3 h-3 text-gold-primary" />
      </div>
      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="w-24 bg-transparent border-none text-xs text-white focus:ring-0 p-1 font-mono"
        title="Límite de Tokens (IA)"
      />
      <button
        onClick={handleUpdate}
        disabled={isPending || limit === currentLimit}
        className="px-3 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[50px]"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (isSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : 'SAVE')}
      </button>
    </div>
  );
}
