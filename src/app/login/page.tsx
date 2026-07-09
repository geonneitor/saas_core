'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-primary/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 md:p-12 rounded-[2rem] shadow-2xl relative"
      >
        <div className="w-14 h-14 bg-gold-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-gold-primary/20 shadow-[0_0_30px_rgba(229,193,88,0.1)]">
          <KeyRound className="w-7 h-7 text-gold-primary" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl font-serif tracking-tight mb-3 text-white">
          Acceso <span className="italic text-gold-primary">Restringido.</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed font-light">
          Identificación biométrica o llave criptográfica requerida para ingresar al Centro de Mando.
        </p>

        <Button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full bg-white text-black hover:bg-neutral-200 py-6 text-xs font-bold tracking-[0.2em] uppercase group flex items-center justify-center gap-3 transition-all duration-300 rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verificando Credenciales...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Autenticar con Google
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-70" />
            </>
          )}
        </Button>

        {loading && (
           <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest animate-pulse">
             Estableciendo conexión segura...
           </p>
        )}
      </motion.div>
      
      <div className="absolute bottom-8 flex items-center gap-2 opacity-30">
        <ShieldAlert className="w-4 h-4 text-white" />
        <p className="text-[10px] text-white uppercase tracking-[0.3em] font-mono">
          Propiedad Privada · Monitoreo Activo
        </p>
      </div>
    </div>
  );
}
