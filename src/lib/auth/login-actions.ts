'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAppUrl } from '@/lib/utils';

export type AuthFormState = { error?: string; success?: string } | undefined;

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3; // Max requests per email
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  
  if (!record || now > record.resetTime) {
    // New window or expired window
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Send magic link to email address
 * Whitelist enforcement happens in middleware after authentication
 * Rate limiting: max 3 requests per email per 10 minutes
 */
export async function sendMagicLinkAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    return { error: 'Email es obligatorio.' };
  }

  // Check rate limit
  if (!checkRateLimit(email)) {
    return { 
      error: 'Demasiadas solicitudes. Por favor espera 10 minutos antes de intentar de nuevo.' 
    };
  }

  const supabase = await createClient();
  
  // Construir URL absoluta con protocolo para que Supabase genere un magic link válido
  const redirectUrl = getAppUrl('/auth/callback');
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Email de verificación enviado. Revisa tu bandeja de entrada.' };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}