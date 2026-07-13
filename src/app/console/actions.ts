'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createTenant(formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;
  const rawSubdomain = formData.get('subdomain') as string;
  const subdomain = rawSubdomain.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  const { data: tenant, error } = await supabase.from('tenants').insert({ name, subdomain, is_active: true }).select().single();
  
  if (tenant && !error) {
    await supabase.from('business_settings').insert({
      tenant_id: tenant.id,
      ai_prompt: `Eres el asistente virtual experto de ${name}. Eres sumamente educado, amable y resolutivo. Tu único objetivo es agendar citas.`,
      opening_time: '09:00:00',
      closing_time: '20:00:00',
      ai_token_limit: 1000 // Inicializar con 1000 tokens para la prueba de 7 días
    });
  }

  if (error) console.error("Error creating tenant:", error);
  revalidatePath('/console');
}

export async function deleteTenant(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'super_admin') return;

  const id = formData.get('id') as string;
  const adminSupabase = createAdminClient();
  await adminSupabase.from('tenants').delete().eq('id', id);
  
  revalidatePath('/console');
  revalidatePath('/console');
  revalidatePath('/', 'layout');
}

export async function updateTokenLimit(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'super_admin') return;

  const id = formData.get('id') as string;
  const limit = parseInt(formData.get('limit') as string, 10);
  
  const adminSupabase = createAdminClient();
  await adminSupabase.from('tenants').update({ ai_token_limit: limit }).eq('id', id);
  
  revalidatePath('/console');
}
