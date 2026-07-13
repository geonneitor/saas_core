import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for module purchases or token packs.
 * @body {{ moduleId: string, tenantId: string, title: string, price: number }}
 * @returns {{ url: string }} - Stripe Checkout URL to redirect the user to.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResult = await rateLimit(ip, 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Por favor, intenta más tarde.' },
        { status: 429 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia' as any,
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { moduleId, tenantId, title } = await req.json();

    if (!moduleId || !tenantId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Catálogo de precios por defecto (evita inyección de precios)
    const MODULE_PRICES: Record<string, number> = {
      'tokens_10k': 10,
      'tokens_50k': 45,
      'tokens_200k': 150,
      'core': 0, // No debería comprarse
    };
    
    // Si no está en el mapa, asume módulo premium genérico
    const price = MODULE_PRICES[moduleId] !== undefined ? MODULE_PRICES[moduleId] : 149;

    if (price <= 0) {
      return NextResponse.json({ error: 'Módulo no válido para compra' }, { status: 400 });
    }

    // Validar ownership: el usuario autenticado DEBE ser dueño del tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('owner_id, subdomain')
      .eq('id', tenantId)
      .single();

    if (!tenant || tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado para este negocio' }, { status: 403 });
    }

    // Construir URLs de retorno robustas para multi-tenant
    const origin = req.headers.get('origin')
      || (process.env.NODE_ENV === 'development'
        ? `http://${tenant.subdomain}.localhost:3000`
        : `https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

    const successUrl = `${origin}/console/store?success=true&module=${moduleId}`;
    const cancelUrl = `${origin}/console/store?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title || 'Módulo Premium',
              description: `Desbloqueo de ${title || moduleId} — pago único`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        moduleId,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE CHECKOUT] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
