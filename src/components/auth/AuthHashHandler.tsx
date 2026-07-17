'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AuthHashHandler() {
  useEffect(() => {
    // Solo ejecutamos si estamos en el navegador y hay un hash con access_token (Flujo Implícito de Supabase)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const supabase = createClient();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
          // Si el hash dice type=invite, redirigimos directamente a /agent, o a la raíz para recargar la sesión
          if (window.location.hash.includes('type=invite')) {
            window.location.href = '/agent';
          } else {
            // Refrescar la página para que el servidor (Next.js) lea la cookie recién establecida
            window.location.href = '/';
          }
        }
      });

      // supabase-js parsea automáticamente el hash de la URL cuando se inicializa / llama getSession
      supabase.auth.getSession();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return null;
}
