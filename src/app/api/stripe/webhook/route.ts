import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';


/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events. Processes `checkout.session.completed`
 * to unlock modules or add AI token packs for the purchasing tenant.
 * Uses service_role (admin) client since webhooks are server-to-server.
 */
export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK] Firma inválida: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[STRIPE WEBHOOK] Evento recibido: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const tenantId = session.metadata?.tenantId;
    const moduleId = session.metadata?.moduleId;
    const amountPaid = session.amount_total; // in cents

    console.log(`[STRIPE WEBHOOK] Pago completado: tenant=${tenantId}, module=${moduleId}, amount=${amountPaid}`);

    if (!tenantId || !moduleId) {
      console.error('[STRIPE WEBHOOK] Metadata incompleta, ignorando evento.');
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    // 1. Obtener estado actual del tenant
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('active_modules, ai_tokens_used, ai_token_limit')
      .eq('id', tenantId)
      .single();

    if (fetchError || !tenant) {
      console.error(`[STRIPE WEBHOOK] Tenant ${tenantId} no encontrado:`, fetchError?.message);
      return NextResponse.json({ received: true });
    }

    // 2. Procesar según tipo de compra      // Setup fee moduleIds - actualizar estado de pago, no active_modules
    if (moduleId === 'setup_advance' || moduleId === 'setup_balance' || moduleId === 'setup_full') {
      const updates: Record<string, boolean> = {};

      if (moduleId === 'setup_advance') {
        // Adelanto parcial — solo marcar advance_paid, NO setup_fee_paid
        updates.setup_advance_paid = true;
      } else {
        // setup_balance o setup_full — marcar como completamente pagado
        updates.setup_fee_paid = true;
        if (moduleId === 'setup_full') {
          // Pago completo implica que el adelanto también está cubierto
          updates.setup_advance_paid = true;
        }
      }

      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId);

      if (error) {
        console.error(`[STRIPE WEBHOOK] Error actualizando setup fee:`, error.message);
      } else {
        console.log(`[STRIPE WEBHOOK] ✅ Setup fee "${moduleId}" procesado para tenant ${tenantId}.`);
      }
    } else if (moduleId.startsWith('tokens_')) {
      // Recarga de tokens de IA
      const tokenMap: Record<string, number> = {
        // WalletDashboard packs (MXN)
        tokens_5k: 5000,
        tokens_15k: 15000,
        tokens_35k: 35000,
        // Store packs (USD — compatibilidad hacia atrás)
        tokens_10k: 10000,
        tokens_50k: 50000,
        tokens_200k: 200000,
      };
      const tokenAmount = tokenMap[moduleId] || 0;

      if (tokenAmount > 0) {
        const { data: processed, error } = await supabase.rpc('handle_stripe_token_purchase', {
          p_event_id: event.id,
          p_event_type: event.type,
          p_tenant_id: tenantId,
          p_amount: tokenAmount
        });

        if (error) {
          console.error(`[STRIPE WEBHOOK] Error actualizando tokens:`, error.message);
        } else if (processed === false) {
          console.log(`[STRIPE WEBHOOK] Evento ${event.id} ignorado por idempotencia (ya procesado).`);
        } else {
          console.log(`[STRIPE WEBHOOK] ✅ +${tokenAmount} tokens para tenant ${tenantId}.`);
        }
      }
    } else {
      // Desbloquear módulo
      const currentModules: string[] = tenant.active_modules || ['core'];

      if (!currentModules.includes(moduleId)) {
        currentModules.push(moduleId);

        const { error } = await supabase
          .from('tenants')
          .update({ active_modules: currentModules })
          .eq('id', tenantId);

        if (error) {
          console.error(`[STRIPE WEBHOOK] Error desbloqueando módulo:`, error.message);
        } else {
          console.log(`[STRIPE WEBHOOK] ✅ Módulo "${moduleId}" desbloqueado para tenant ${tenantId}. Módulos activos: ${JSON.stringify(currentModules)}`);
        }
      } else {
        console.log(`[STRIPE WEBHOOK] Módulo "${moduleId}" ya estaba activo, sin cambios.`);
      }
    }
  }

  return NextResponse.json({ received: true });
}

