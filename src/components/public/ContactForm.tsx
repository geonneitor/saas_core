'use client';

import { useState, useTransition } from 'react';
import { signUpAction } from '@/lib/auth/login-actions';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [honeypot, setHoneypot] = useState('');

  function handleSubmit(formData: FormData) {
    if (honeypot) return; // bot detected
    startTransition(async () => {
      const result = await signUpAction(undefined, formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        (document.getElementById('contact-form') as HTMLFormElement)?.reset();
      }
    });
  }

  return (
    <form
      id="contact-form"
      action={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      {/* Honeypot - hidden field that bots will fill */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none -left-[9999px]"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="cf-email" className="text-[10px] uppercase tracking-widest text-neutral-500">
          Únete a la lista de espera
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          placeholder="tu@empresa.com"
          disabled={pending}
          className="bg-[#0a0a0f] border border-white/10 focus:border-[#ff0055] outline-none px-4 py-3 text-sm text-white placeholder:text-neutral-600 transition-colors disabled:opacity-50"
        />
        <input
          name="password"
          type="hidden"
          value="waitlist-temp-2024"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="group flex items-center justify-center gap-3 px-6 py-3 bg-[#ff0055] hover:bg-[#ff0055]/90 text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Notificarme al lanzamiento
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
