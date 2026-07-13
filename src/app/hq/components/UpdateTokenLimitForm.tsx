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
    <div 
      className="flex items-center gap-1.5 p-1 max-w-[170px] border-brutal"
      style={{ backgroundColor: 'var(--acid-bg)' }}
    >
      <div className="pl-1.5">
        <Zap 
          className="w-3 h-3" 
          style={{ 
            color: 'var(--acid-neon)',
            filter: 'drop-shadow(0 0 4px rgba(193, 255, 0, 0.5))' 
          }} 
        />
      </div>
      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="w-16 bg-transparent border-none text-xs focus:outline-none focus:ring-0 p-0.5"
        style={{ color: 'var(--acid-text)', fontFamily: 'var(--font-geist-mono)' }}
        title="Límite de Tokens (IA)"
      />
      <button
        onClick={handleUpdate}
        disabled={isPending || limit === currentLimit}
        className="px-2 py-0.5 rounded-none font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[40px] cursor-pointer"
        style={{
          backgroundColor: 'var(--acid-neon)',
          color: 'var(--acid-bg)',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '10px'
        }}
      >
        {isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : (isSuccess ? <Check className="w-2.5 h-2.5" style={{ color: 'var(--acid-bg)' }} /> : 'SAVE')}
      </button>
    </div>
  );
}
