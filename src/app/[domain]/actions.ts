"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function bookAppointment(tenantId: string, data: { clientName: string, date: string, time: string, notes: string }) {
  const supabase = await createClient();

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

export async function updateAiAvatar(tenantId: string, avatarName: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('business_settings')
      .update({ ai_avatar: avatarName })
      .eq('tenant_id', tenantId);

    if (error) throw error;
    revalidatePath('/[domain]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error actualizando avatar:', error);
    return { success: false, error: error.message };
  }
}
