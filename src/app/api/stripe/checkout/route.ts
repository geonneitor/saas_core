import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// @ts-ignore - Stripe API version might differ based on installed package
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { tenantId, plan, returnUrl } = await req.json();

    if (!tenantId) {
       return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // ID del precio en Stripe (Idealmente viene de la BD o variables de entorno)
    // Para desarrollo, puedes poner tu price_id aquí:
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID || "price_1xxxxxxxxxxxxx"; 

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      metadata: {
        tenantId, // Metadato crucial para que el webhook sepa a quién activar
        plan: plan || 'premium'
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
