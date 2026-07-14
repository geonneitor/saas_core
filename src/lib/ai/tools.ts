import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Asserts that a resource belongs to the given tenant.
 * Throws TENANT_MISMATCH if it doesn't, which the caller can map to 403/404.
 */
function assertTenantOwnership<T extends { tenant_id: string }>(
  resource: T | null | undefined,
  tenantId: string,
  context: { tool: string; userId: string | null }
): asserts resource is T {
  if (!resource) {
    console.warn(`[AI Security] ${context.tool}: resource not found for tenant ${tenantId}`);
    throw new Error('RESOURCE_NOT_FOUND');
  }
  if (resource.tenant_id !== tenantId) {
    console.error(
      `[AI Security] TENANT MISMATCH: tool=${context.tool} expected=${tenantId} actual=${resource.tenant_id} user=${context.userId}`
    );
    throw new Error('TENANT_MISMATCH');
  }
}

export async function checkAvailability(tenantId: string, date: string) {
  const supabase = createAdminClient();
  try {
    const { data: settings } = await supabase
      .from('business_settings')
      .select('opening_time, closing_time')
      .eq('tenant_id', tenantId)
      .single();

    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time, status')
      .eq('tenant_id', tenantId)
      .gte('start_time', `${date}T00:00:00Z`)
      .lte('start_time', `${date}T23:59:59Z`)
      .neq('status', 'cancelled');

    return {
      success: true,
      data: {
        business_hours: settings || { opening_time: '09:00:00', closing_time: '18:00:00' },
        booked_appointments: appointments || [],
        message: 'Resumen de citas del día devuelto con éxito. Compara las citas ocupadas con el horario laboral para ofrecer espacios disponibles.'
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bookAppointment(
  tenantId: string,
  customerName: string,
  customerEmail: string | undefined,
  customerPhone: string | undefined,
  date: string,
  time: string,
  notes: string = ''
) {
  const supabase = createAdminClient();
  try {
    let customerId = null;

    if (customerEmail) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, tenant_id')
        .eq('tenant_id', tenantId)
        .eq('email', customerEmail)
        .maybeSingle();

      if (existingCustomer) {
        // Defense in depth: even if email matches, the .eq('tenant_id') already filters
        assertTenantOwnership(existingCustomer, tenantId, { tool: 'bookAppointment', userId: null });
        customerId = existingCustomer.id;
      }
    }

    if (!customerId && customerPhone) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, tenant_id')
        .eq('tenant_id', tenantId)
        .eq('phone', customerPhone)
        .maybeSingle();

      if (existingCustomer) {
        assertTenantOwnership(existingCustomer, tenantId, { tool: 'bookAppointment', userId: null });
        customerId = existingCustomer.id;
      }
    }

    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          tenant_id: tenantId,
          name: customerName,
          email: customerEmail || `${Date.now()}@temp.com`,
          phone: customerPhone || null
        })
        .select('id, tenant_id')
        .single();

      if (customerError) throw customerError;
      assertTenantOwnership(newCustomer, tenantId, { tool: 'bookAppointment', userId: null });
      customerId = newCustomer.id;
    }

    const startTimeStr = `${date}T${time}:00`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert({
        tenant_id: tenantId,
        customer_id: customerId,
        title: `Cita con ${customerName}`,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled',
        notes: notes
      })
      .select('id, start_time, end_time, tenant_id')
      .single();

    if (aptError) throw aptError;
    assertTenantOwnership(appointment, tenantId, { tool: 'bookAppointment', userId: null });

    return {
      success: true,
      data: {
        message: 'Cita agendada exitosamente.',
        appointment: appointment
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelAppointment(
  tenantId: string,
  appointmentId: string,
  customerEmailOrPhone: string | undefined,
  isAdmin: boolean,
  actingUserId: string | null
) {
  const supabase = createAdminClient();
  try {
    // Defense in depth: isAdmin=true requires a real userId
    if (isAdmin && !actingUserId) {
      console.error('[AI Security] cancelAppointment called with isAdmin=true but no actingUserId');
      return { success: false, error: 'Internal: missing actor' };
    }

    // Fetch the appointment with explicit tenant_id for assert
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, tenant_id, customers(email, phone)')
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (fetchError || !appointment) {
      return { success: false, error: 'Cita no encontrada.' };
    }

    // The .eq('tenant_id', tenantId) above already filters, but assert makes
    // it explicit and logs suspicious activity.
    assertTenantOwnership(appointment, tenantId, { tool: 'cancelAppointment', userId: actingUserId });

    if (!isAdmin) {
      if (!customerEmailOrPhone) {
        return { success: false, error: 'Se requiere el correo electrónico o número de teléfono del cliente para verificar y cancelar la cita.' };
      }

      const customer = Array.isArray(appointment.customers) ? appointment.customers[0] : appointment.customers;
      const emailMatch = customer?.email && customer.email.trim().toLowerCase() === customerEmailOrPhone.trim().toLowerCase();
      const phoneMatch = customer?.phone && customer.phone.replace(/\D/g, '') === customerEmailOrPhone.replace(/\D/g, '');

      if (!emailMatch && !phoneMatch) {
        return { success: false, error: 'La validación de identidad falló. El correo o teléfono proporcionado no coincide con el registro de la cita.' };
      }
    }

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return { success: true, message: 'La cita ha sido cancelada exitosamente.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rescheduleAppointment(
  tenantId: string,
  appointmentId: string,
  newDate: string,
  newTime: string,
  customerEmailOrPhone: string | undefined,
  isAdmin: boolean,
  actingUserId: string | null
) {
  const supabase = createAdminClient();
  try {
    if (isAdmin && !actingUserId) {
      console.error('[AI Security] rescheduleAppointment called with isAdmin=true but no actingUserId');
      return { success: false, error: 'Internal: missing actor' };
    }

    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, tenant_id, customers(email, phone)')
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (fetchError || !appointment) {
      return { success: false, error: 'Cita no encontrada.' };
    }

    assertTenantOwnership(appointment, tenantId, { tool: 'rescheduleAppointment', userId: actingUserId });

    if (!isAdmin) {
      if (!customerEmailOrPhone) {
        return { success: false, error: 'Se requiere el correo electrónico o número de teléfono del cliente para verificar y reagendar la cita.' };
      }

      const customer = Array.isArray(appointment.customers) ? appointment.customers[0] : appointment.customers;
      const emailMatch = customer?.email && customer.email.trim().toLowerCase() === customerEmailOrPhone.trim().toLowerCase();
      const phoneMatch = customer?.phone && customer.phone.replace(/\D/g, '') === customerEmailOrPhone.replace(/\D/g, '');

      if (!emailMatch && !phoneMatch) {
        return { success: false, error: 'La validación de identidad falló. El correo o teléfono proporcionado no coincide con el registro de la cita.' };
      }
    }

    const startTimeStr = `${newDate}T${newTime}:00`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('appointments')
      .update({
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled'
      })
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .select('id, start_time, end_time, tenant_id')
      .single();

    if (error) throw error;
    assertTenantOwnership(data, tenantId, { tool: 'rescheduleAppointment', userId: actingUserId });

    return {
      success: true,
      message: 'La cita ha sido reagendada exitosamente.',
      appointment: data
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBusinessStats(tenantId: string) {
  const supabase = createAdminClient();
  try {
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const { count: aptCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('start_time', new Date().toISOString());

    return {
      success: true,
      data: {
        total_customers: customerCount || 0,
        upcoming_appointments: aptCount || 0,
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
