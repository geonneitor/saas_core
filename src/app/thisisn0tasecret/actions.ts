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

  const adminSupabase = createAdminClient();
  const { data: { user } } = await clientSupabase.auth.getUser();
  const name = formData.get('name') as string;
  const rawSubdomain = formData.get('subdomain') as string;
  const subdomain = rawSubdomain.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Set initial token limit of 1000 directly on tenants table
  const { data: tenant, error } = await adminSupabase
    .from('tenants')
    .insert({ name, subdomain, is_active: true, ai_token_limit: 1000, owner_id: user?.id || null })
    .select()
    .single();
  
  if (tenant && !error) {
    await adminSupabase.from('business_settings').insert({
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
  await supabase.rpc('suspend_tenant', { p_tenant_id: id });
  
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
  
  await supabase.rpc('update_tenant_token_limit', { p_tenant_id: id, p_new_limit: limit });
  
  revalidatePath('/thisisn0tasecret');
}

export async function inviteAgent(formData: FormData) {
  const supabase = await createClient();
  try {
    await requireSuperAdmin(supabase);
  } catch (e) {
    console.error('[inviteAgent] Auth failed:', e);
    return { error: 'No autorizado' };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  if (!email) return { error: 'Email requerido' };

  const adminSupabase = createAdminClient();

  // Try to invite the user
  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email);
  
  let targetUserId = inviteData?.user?.id;

  // If user already exists or invite fails, fallback to finding the user
  if (!targetUserId) {
    let page = 1;
    const perPage = 100;
    while (!targetUserId) {
      const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers({ page, perPage });
      if (listError || !usersData.users || usersData.users.length === 0) break;
      const found = usersData.users.find((u) => u.email?.toLowerCase() === email);
      if (found) targetUserId = found.id;
      if (usersData.users.length < perPage) break;
      page++;
    }
  }

  if (!targetUserId) {
    console.error('[inviteAgent] inviteError:', inviteError);
    return { error: inviteError?.message || 'No se pudo crear ni encontrar la invitación para este usuario.' };
  }

  // Update profile to agent role (Supabase trigger usually creates the profile row instantly)
  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ role: 'agent' })
    .eq('id', targetUserId);

  if (updateError) {
    // If update fails, maybe the trigger hasn't fired yet, try an upsert
    await adminSupabase.from('profiles').upsert({ id: targetUserId, role: 'agent' });
  }

  revalidatePath('/thisisn0tasecret');
  return { success: true };
}

export async function assignAgentToTenant(formData: FormData) {
  const supabase = await createClient();
  try {
    await requireSuperAdmin(supabase);
  } catch (e) {
    console.error('[assignAgentToTenant] Auth failed:', e);
    return { error: 'No autorizado' };
  }

  const tenantId = formData.get('tenantId') as string;
  const agentId = formData.get('agentId') as string; // if empty string, we set to null

  const adminSupabase = createAdminClient();
  
  const { error } = await adminSupabase
    .from('tenants')
    .update({ agent_id: agentId ? agentId : null } as any)
    .eq('id', tenantId);

  if (error) return { error: 'Error al asignar agente' };

  revalidatePath('/thisisn0tasecret');
  return { success: true };
}