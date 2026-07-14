'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Loader2, KeyRound, Mail } from 'lucide-react';
import { useState, useTransition } from 'react';
import { sendMagicLinkAction, type AuthFormState } from '@/lib/auth/login-actions';
import { toast } from 'sonner';

export default function LoginPage() {
  const [pending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result: AuthFormState = await sendMagicLinkAction(undefined, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setEmailSent(true);
        toast.success(result.success);
      }
    });
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-primary/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 md:p-12 rounded-[2rem] shadow-2xl relative text-center"
        >
          <div className="w-14 h-14 bg-gold-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-gold-primary/20 shadow-[0_0_30px_rgba(229,193,88,0.1)] mx-auto">
            <Mail className="w-7 h-7 text-gold-primary" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl font-serif tracking-tight mb-3 text-white">
            Email <span className="italic text-gold-primary">Enviado.</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed font-light">
            Revisa tu bandeja de entrada y haz clic en el enlace de verificación para acceder al sistema.
          </p>

          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full border-white/[0.1] text-white hover:bg-white/[0.05] h-11 text-xs font-bold tracking-[0.2em] uppercase"
          >
            Enviar otro email
          </Button>
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

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-primary/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />
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
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed font-light">
          Ingresa tu email para recibir un enlace de verificación seguro. 
          No se requiere contraseña.
        </p>

        <form action={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              name="email"
              type="email"
              required
              placeholder="email@empresa.com"
              disabled={pending}
              className="pl-10 bg-white/[0.03] border-white/[0.1] focus:border-gold-primary/50 h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-gold-primary text-black hover:bg-gold-primary/90 h-11 text-xs font-bold tracking-[0.2em] uppercase"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando enlace...
              </>
            ) : (
              'Enviar enlace mágico'
            )}
          </Button>
        </form>

        {pending && (
          <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest animate-pulse">
            Verificando credenciales...
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