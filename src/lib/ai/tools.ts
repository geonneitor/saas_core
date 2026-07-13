import { createAdminClient } from '@/lib/supabase/admin';

export async function checkAvailability(tenantId: string, date: string) {
  const supabase = createAdminClient();
  try {
    // Buscar configuración del negocio para horarios
    const { data: settings } = await supabase
      .from('business_settings')
      .select('opening_time, closing_time')
      .eq('tenant_id', tenantId)
      .single();

    // Buscar citas existentes en ese día
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
      // Intentar encontrar al cliente por email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('email', customerEmail)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    if (!customerId && customerPhone) {
      // Intentar encontrar al cliente por teléfono
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('phone', customerPhone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    if (!customerId) {
      // Crear cliente
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          tenant_id: tenantId,
          name: customerName,
          email: customerEmail || `${Date.now()}@temp.com`,
          phone: customerPhone || null
        })
        .select('id')
        .single();

      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // Calcular end_time (por defecto 1 hora después)
    const startTimeStr = `${date}T${time}:00`;
    const startDate = new Date(startTimeStr);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora

    // Insertar cita
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
      .select('id, start_time, end_time')
      .single();

    if (aptError) throw aptError;

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
  customerEmailOrPhone?: string,
  isAdmin = false
) {
  const supabase = createAdminClient();
  try {
    if (!isAdmin) {
      if (!customerEmailOrPhone) {
        return { success: false, error: 'Se requiere el correo electrónico o número de teléfono del cliente para verificar y cancelar la cita.' };
      }

      // Obtener la cita y los datos del cliente
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('id, customers(email, phone)')
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId)
        .single();

      if (fetchError || !appointment) {
        return { success: false, error: 'Cita no encontrada.' };
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
  customerEmailOrPhone?: string,
  isAdmin = false
) {
  const supabase = createAdminClient();
  try {
    if (!isAdmin) {
      if (!customerEmailOrPhone) {
        return { success: false, error: 'Se requiere el correo electrónico o número de teléfono del cliente para verificar y reagendar la cita.' };
      }

      // Obtener la cita y los datos del cliente
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('id, customers(email, phone)')
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId)
        .single();

      if (fetchError || !appointment) {
        return { success: false, error: 'Cita no encontrada.' };
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
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora

    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled'
      })
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .select('id, start_time, end_time')
      .single();

    if (error) throw error;
    
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
