'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export function PurchaseButton({ tenantId, moduleId, price, title }: { tenantId: string, moduleId: string, price: number, title: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, tenantId, price, title }) 
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al iniciar el pago');
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con Stripe');
      setIsLoading(false);
    }
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
