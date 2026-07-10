import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// @ts-ignore - Stripe API version might differ based on installed package
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { tenantId, priceId, returnUrl } = await req.json();

    if (!tenantId || !priceId) {
       return NextResponse.json({ error: 'Tenant ID and Price ID are required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      metadata: {
        tenantId,
        priceId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
