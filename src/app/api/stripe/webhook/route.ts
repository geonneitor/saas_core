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
    // Pagos únicos del Modelo Prepago
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenantId;
      const priceId = session.metadata?.priceId;

      if (tenantId && priceId) {
        if (priceId === 'price_setup_full' || priceId === 'price_setup_balance') {
          // Pago completo de adquisición
          await supabase.from('tenants').update({
            setup_fee_paid: true,
            stripe_customer_id: session.customer as string
          }).eq('id', tenantId);
          
          await supabase.from('wallet_transactions').insert({
            tenant_id: tenantId,
            transaction_type: priceId === 'price_setup_full' ? 'setup_fee' : 'setup_balance',
            amount_mxn: (session.amount_total || 0) / 100,
            stripe_session_id: session.id
          });
        } 
        else if (priceId === 'price_setup_advance') {
          // Adelanto de adquisición (30%)
          await supabase.from('tenants').update({
            setup_advance_paid: true,
            stripe_customer_id: session.customer as string
          }).eq('id', tenantId);

          await supabase.from('wallet_transactions').insert({
            tenant_id: tenantId,
            transaction_type: 'setup_advance',
            amount_mxn: (session.amount_total || 0) / 100,
            stripe_session_id: session.id
          });
        }
        else if (priceId.startsWith('price_tokens_')) {
          // Recarga de Billetera (Tokens)
          let tokensToAdd = 0;
          if (priceId === 'price_tokens_150') tokensToAdd = 5000;
          else if (priceId === 'price_tokens_350') tokensToAdd = 15000;
          else if (priceId === 'price_tokens_750') tokensToAdd = 35000;

          // Revisar si aplica promo del 50% extra (pagó adelanto pero no setup full)
          const { data: tenant } = await supabase.from('tenants').select('setup_advance_paid, setup_fee_paid').eq('id', tenantId).single();
          if (tenant && tenant.setup_advance_paid && !tenant.setup_fee_paid) {
             tokensToAdd = Math.floor(tokensToAdd * 1.5);
          }

          // Obtener límite actual
          const { data: settings } = await supabase.from('business_settings').select('ai_tokens_limit').eq('tenant_id', tenantId).single();
          const currentLimit = settings?.ai_tokens_limit || 0;
          
          // Actualizar límite (sumar)
          await supabase.from('business_settings').update({
            ai_tokens_limit: currentLimit + tokensToAdd
          }).eq('tenant_id', tenantId);

          await supabase.from('wallet_transactions').insert({
            tenant_id: tenantId,
            transaction_type: 'token_recharge',
            amount_mxn: (session.amount_total || 0) / 100,
            tokens_added: tokensToAdd,
            stripe_session_id: session.id
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (dbError: any) {
    console.error(`[Webhook DB Error]:`, dbError);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
