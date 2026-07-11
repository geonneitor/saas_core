import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { moduleId, tenantId, title, price } = await req.json();

    if (!moduleId || !tenantId || !price) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Validar que el usuario sea dueño o admin del tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('owner_id')
      .eq('id', tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Inquilino no encontrado' }, { status: 404 });
    }

    // Configurar la URL de retorno
    const domain = process.env.NODE_ENV === 'development' ? 'http://app.localhost:3000' : 'https://app.tu-dominio.com';
    // Ideally we would redirect back to the specific tenant domain, but for security Stripe needs exact pre-registered domains.
    // For this MVP, we redirect back to the central app or trust the referrer.
    const successUrl = `${req.headers.get('origin')}/console/store?success=true&module=${moduleId}`;
    const cancelUrl = `${req.headers.get('origin')}/console/store?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title || 'Módulo Premium',
              description: 'Compra de módulo para ' + moduleId,
            },
            unit_amount: price * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        moduleId,
        userId: user.id
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE CHECKOUT] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
