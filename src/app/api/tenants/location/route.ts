import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 });
    }

    const { tenantId, lat, lng, address, phone, openingTime, closingTime } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requerido' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (lat !== null && lat !== undefined) updateData.latitude = lat;
    if (lng !== null && lng !== undefined) updateData.longitude = lng;
    if (phone) updateData.whatsapp_number = phone;
    if (openingTime) updateData.opening_time = openingTime;
    if (closingTime) updateData.closing_time = closingTime;
    // Nota: 'address' no está en business_settings, se omite por ahora

    // Upsert: check if row exists first, then update or insert
    const { data: existing } = await admin
      .from('business_settings')
      .select('id')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    let queryError;
    if (existing) {
      const res = await admin
        .from('business_settings')
        .update(updateData)
        .eq('tenant_id', tenantId);
      queryError = res.error;
    } else {
      const res = await admin
        .from('business_settings')
        .insert({ tenant_id: tenantId, ...updateData });
      queryError = res.error;
    }

    if (queryError) {
      console.error('[Location Update] Error:', queryError);
      return NextResponse.json({ error: 'Error al actualizar ubicación' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Location Update] Error:', error.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
