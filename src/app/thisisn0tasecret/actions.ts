'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperAdmin } from '@/lib/auth/super-admin';
import { revalidatePath } from 'next/cache';

export async function createTenant(formData: FormData) {
  const clientSupabase = await createClient();
  try {
    await requireSuperAdmin(clientSupabase);
  } catch (e) {
    console.error('[createTenant] Auth failed:', e);
    return;
  }

  const supabase = createAdminClient();
  const name = formData.get('name') as string;
  const rawSubdomain = formData.get('subdomain') as string;
  const subdomain = rawSubdomain.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Set initial token limit of 1000 directly on tenants table
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({ name, subdomain, is_active: true, ai_token_limit: 1000 })
    .select()
    .single();
  
  if (tenant && !error) {
    await supabase.from('business_settings').insert({
      tenant_id: tenant.id,
      ai_prompt: `Eres el asistente virtual experto de ${name}. Eres sumamente educado, amable y resolutivo. Tu único objetivo es agendar citas.`,
      opening_time: '09:00:00',
      closing_time: '20:00:00'
    });
  }

  if (error) console.error("Error creating tenant:", error);
  revalidatePath('/thisisn0tasecret');
}

export async function deleteTenant(formData: FormData) {
  const supabase = await createClient();
  try {
    await requireSuperAdmin(supabase);
  } catch (e) {
    console.error('[deleteTenant] Auth failed:', e);
    return;
  }

  const id = formData.get('id') as string;
  const adminSupabase = createAdminClient();
  await adminSupabase.rpc('suspend_tenant', { p_tenant_id: id });
  
  revalidatePath('/thisisn0tasecret');
  revalidatePath('/', 'layout');
}

export async function updateTokenLimit(formData: FormData) {
  const supabase = await createClient();
  try {
    await requireSuperAdmin(supabase);
  } catch (e) {
    console.error('[updateTokenLimit] Auth failed:', e);
    return;
  }

  const id = formData.get('id') as string;
  const limit = parseInt(formData.get('limit') as string, 10);
  
  const adminSupabase = createAdminClient();
  await adminSupabase.rpc('update_tenant_token_limit', { p_tenant_id: id, p_new_limit: limit });
  
  revalidatePath('/thisisn0tasecret');
}