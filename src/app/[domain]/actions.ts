"use server";

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function bookAppointment(tenantId: string, data: { clientName: string, date: string, time: string, notes: string }) {
  const supabase = createAdminClient();

  try {
    // 1. Buscar o crear cliente
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .ilike('name', data.clientName)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({ tenant_id: tenantId, name: data.clientName })
        .select()
        .single();
      
      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // 2. Crear cita
    const startDateTime = new Date(`${data.date}T${data.time}`);
    // Asumimos 1 hora de duración por defecto para el MVP
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const { error: aptError } = await supabase
      .from('appointments')
      .insert({
        tenant_id: tenantId,
        customer_id: customerId,
        title: `Cita con ${data.clientName}`,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'scheduled',
        notes: data.notes
      });

    if (aptError) throw aptError;

    // Refrescar el calendario del inquilino
    revalidatePath('/[domain]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error al agendar cita:', error);
    return { success: false, error: error.message };
  }
}

export async function updateAiSettings(tenantId: string, data: { ai_avatar?: string, ai_prompt?: string, groq_api_key?: string }) {
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
    return { success: false, error: 'Sin permisos de administrador para este tenant' };
  }
  
  try {
    const { data: existing } = await supabase
      .from('business_settings')
      .select('id')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    let error;
    if (existing) {
      const res = await supabase.from('business_settings').update(data).eq('tenant_id', tenantId).select();
      error = res.error;
    } else {
      const res = await supabase.from('business_settings').insert({ tenant_id: tenantId, ...data }).select();
      error = res.error;
    }

    if (error) throw error;
    
    revalidatePath('/[domain]', 'page');
    revalidatePath('/[domain]/admin', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('[updateAiSettings] Error actualizando settings de IA:', error);
    return { success: false, error: error.message };
  }
}

export async function updateVisualSettings(tenantId: string, data: { theme?: string, font?: string, hero_image?: string }) {
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
    const { error } = await supabase.from('business_settings').update(data).eq('tenant_id', tenantId);
    if (error) throw error;
    
    revalidatePath('/[domain]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error actualizando estilos:', error);
    return { success: false, error: error.message };
  }
}

