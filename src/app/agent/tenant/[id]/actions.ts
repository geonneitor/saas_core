'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Agent updates their tenant's quick config
 * Uses RLS policies (tenants_agent_update, business_settings_agent_update)
 * to ensure the agent can only modify their own assigned tenants.
 */
export async function updateTenantConfig(
  tenantId: string,
  data: {
    ai_prompt?: string;
    services_json?: string; // JSON string from form
    whatsapp_number?: string;
    ai_tone?: string;
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    // Verify the user has agent role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'agent') {
      return { success: false, error: 'Sin permisos de agente' };
    }

    // Verify agent owns this tenant (RLS provides additional protection)
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, name, agent_id')
      .eq('id', tenantId)
      .single();

    if (!tenant) {
      return { success: false, error: 'Inquilino no encontrado o sin acceso' };
    }

    // Build the update payload for business_settings
    const settingsUpdate: Record<string, unknown> = {};

    if (data.ai_prompt !== undefined) {
      settingsUpdate.ai_prompt = data.ai_prompt;
    }

    if (data.services_json !== undefined) {
      try {
        settingsUpdate.services_json = JSON.parse(data.services_json);
      } catch {
        return { success: false, error: 'El formato de servicios no es válido (JSON)' };
      }
    }

    if (data.whatsapp_number !== undefined) {
      settingsUpdate.whatsapp_number = data.whatsapp_number;
    }

    if (data.ai_tone !== undefined) {
      settingsUpdate.ai_tone = data.ai_tone;
    }

    // Upsert business_settings (agent RLS handles access control)
    const { data: existing } = await supabase
      .from('business_settings')
      .select('id')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    let dbError;

    if (existing) {
      const res = await supabase
        .from('business_settings')
        .update(settingsUpdate)
        .eq('tenant_id', tenantId);
      dbError = res.error;
    } else if (Object.keys(settingsUpdate).length > 0) {
      const res = await supabase
        .from('business_settings')
        .insert({ tenant_id: tenantId, ...settingsUpdate });
      dbError = res.error;
    }

    if (dbError) {
      console.error('[Agent Update Tenant] DB Error:', dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath(`/agent/tenant/${tenantId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[Agent Update Tenant]', error);
    return { success: false, error: error.message };
  }
}


