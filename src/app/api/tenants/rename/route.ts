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

    const { tenantId, name } = await req.json();

    if (!tenantId || !name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('tenants')
      .update({ name: name.trim() })
      .eq('id', tenantId);

    if (error) {
      console.error('[Rename Tenant] Error:', error);
      return NextResponse.json({ error: 'Error al actualizar nombre' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Rename Tenant] Error:', error.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
