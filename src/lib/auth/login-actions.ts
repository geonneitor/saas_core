'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/auth/super-admin';

export type AuthFormState = { error?: string; success?: string } | undefined;

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Decide redirect target based on role
  const { data: { user } } = await supabase.auth.getUser();
  if (user && (await isSuperAdmin(supabase, user.id))) {
    redirect('/hq');
  }

  redirect('/login?welcome=1');
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' };
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Revisa tu email para confirmar la cuenta.' };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
