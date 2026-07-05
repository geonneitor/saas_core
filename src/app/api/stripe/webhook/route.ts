import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook Signature Error]: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // 1. Pago inicial (Suscripción Creada)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenantId;

      if (tenantId) {
        // Activar la suscripción en el tenant
        await supabase.from('tenants').update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
          subscription_plan: session.metadata?.plan || 'premium'
        }).eq('id', tenantId);

        // Resetear tokens usados y setear nuevo límite (ej. 1000 tokens)
        await supabase.from('business_settings').update({
          ai_tokens_limit: 1000,
          ai_tokens_used: 0
        }).eq('tenant_id', tenantId);
      }
    }

    // 2. Renovación exitosa del mes
    if (event.type === 'invoice.payment_succeeded') {
       const invoice = event.data.object as any;
       if (invoice.subscription) {
          // Buscar tenant por su suscripción de Stripe
          const { data: tenant } = await supabase.from('tenants').select('id').eq('stripe_subscription_id', invoice.subscription).single();
          
          if (tenant) {
              // Resetear contador de tokens al iniciar nuevo ciclo de facturación
              await supabase.from('business_settings').update({
                  ai_tokens_used: 0
              }).eq('tenant_id', tenant.id);
          }
       }
    }

    return NextResponse.json({ received: true });
  } catch (dbError: any) {
    console.error(`[Webhook DB Error]:`, dbError);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
