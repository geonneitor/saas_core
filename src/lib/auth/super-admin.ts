import { SupabaseClient } from '@supabase/supabase-js';

export interface SuperAdminCheckResult {
  isSuperAdmin: boolean;
  userId: string | null;
}

/**
 * Verifica si el usuario autenticado tiene role='super_admin' en profiles.
 * Única fuente de verdad. NUNCA hardcodear emails.
 */
export async function isSuperAdmin(
  supabase: SupabaseClient,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return data.role === 'super_admin';
}

/**
 * Variante que retorna el user de la sesión. Usar en Server Actions.
 * Si falla la validación, lanza error explícito (NO return silencioso).
 */
export async function requireSuperAdmin(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHORIZED: No active session');
  if (!(await isSuperAdmin(supabase, user.id))) {
    throw new Error('FORBIDDEN: super_admin role required');
  }
  return user.id;
}
