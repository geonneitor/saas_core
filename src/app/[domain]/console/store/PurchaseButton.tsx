'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export function PurchaseButton({ tenantId, moduleId, price, title }: { tenantId: string, moduleId: string, price: number, title: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    // TODO: Llamar a /api/stripe/checkout pasándole el moduleId y tenantId
    // const res = await fetch('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ moduleId, tenantId }) });
    // const { url } = await res.json();
    // window.location.href = url;
    
    // Simulación temporal:
    setTimeout(() => {
      alert(`Pronto te redirigiremos a Stripe para pagar $${price} USD por ${title}`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <button 
      onClick={handlePurchase}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-premium-gold text-xs font-bold uppercase tracking-widest disabled:opacity-50"
    >
      <ShoppingCart className="w-4 h-4" />
      {isLoading ? 'Procesando...' : 'Desbloquear Ahora'}
    </button>
  );
}
