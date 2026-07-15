"use server";

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';


export async function updateAiSettings(tenantId: string, data: { ai_avatar?: string, ai_prompt?: string, groq_api_key?: string, ai_tone?: string, services_json?: any, ai_rules?: string }) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('owner_id')
    .eq('id', tenantId)
    .single();

  if (!tenantData || tenantData.owner_id !== user.id) {
    // If not owner, check if super_admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'super_admin') {
      return { success: false, error: 'Sin permisos de administrador para este tenant' };
    }
  }
  
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from('business_settings')
      .select('id')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    let error;
    if (existing) {
      const res = await admin.from('business_settings').update(data).eq('tenant_id', tenantId).select();
      error = res.error;
    } else {
      const res = await admin.from('business_settings').insert({ tenant_id: tenantId, ...data }).select();
      error = res.error;
    }

    if (error) throw error;
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[updateAiSettings] Error actualizando settings de IA:', error);
    return { success: false, error: error.message };
  }
}

export async function updateVisualSettings(tenantId: string, data: { theme?: string, font?: string, hero_image?: string, brand_tagline?: string }) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('owner_id')
    .eq('id', tenantId)
    .single();

  if (!tenantData || tenantData.owner_id !== user.id) {
    // If not owner, check if super_admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'super_admin') {
      return { success: false, error: 'Sin permisos de administrador para este tenant' };
    }
  }
  
  try {
    const admin = createAdminClient();

    // Upsert: check if row exists first
    const { data: existing } = await admin
      .from('business_settings')
      .select('id')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    let error;
    if (existing) {
      const res = await admin.from('business_settings').update(data).eq('tenant_id', tenantId);
      error = res.error;
    } else {
      const res = await admin.from('business_settings').insert({ tenant_id: tenantId, ...data });
      error = res.error;
    }

    if (error) throw error;
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error actualizando estilos:', error);
    return { success: false, error: error.message };
  }
}

