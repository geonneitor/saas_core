'use client';

import { Button } from '@/components/ui/button';
import { createStripeConnectAccount } from './actions';
import { useState } from 'react';

export function StripeConnectButton() {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    const result = await createStripeConnectAccount();
    if (result.url) {
      window.location.href = result.url;
    } else {
      console.error(result.error);
      alert('Error al conectar con Stripe: ' + result.error);
      setLoading(false);
    }
  }

  return (
    <Button 
      variant="destructive" 
      className="font-mono uppercase tracking-wider"
      onClick={handleConnect}
      disabled={loading}
    >
      {loading ? 'Conectando...' : 'Conectar con Stripe'}
    </Button>
  );
}
