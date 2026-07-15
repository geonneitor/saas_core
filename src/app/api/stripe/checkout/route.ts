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

    // Catálogo de precios SERVER-SIDE (evita inyección de precios desde el cliente).
    // Cada entrada define precio, moneda y título para la sesión de Stripe.
    const MODULE_CATALOG: Record<string, { price: number; currency: 'mxn' | 'usd'; title: string }> = {
      // --- Token packs desde WalletDashboard (MXN) ---
      'tokens_5k':  { price: 150,  currency: 'mxn', title: 'Pack Inicial 5,000 Tokens' },
      'tokens_15k': { price: 350,  currency: 'mxn', title: 'Pack Crecimiento 15,000 Tokens' },
      'tokens_35k': { price: 750,  currency: 'mxn', title: 'Pack Enterprise 35,000 Tokens' },

      // --- Token packs desde Store (USD — compatibilidad hacia atrás) ---
      'tokens_10k':  { price: 10,   currency: 'usd', title: 'Pack 10,000 Tokens' },
      'tokens_50k':  { price: 45,   currency: 'usd', title: 'Pack 50,000 Tokens' },
      'tokens_200k': { price: 150,  currency: 'usd', title: 'Pack 200,000 Tokens' },

      // --- Módulos del Store (USD — compatibilidad hacia atrás) ---
      'whatsapp':  { price: 149, currency: 'usd', title: 'WhatsApp Autopilot' },
      'pos':       { price: 99,  currency: 'usd', title: 'Terminal POS' },
      'analytics': { price: 49,  currency: 'usd', title: 'Analytics Avanzado' },

      // --- Setup fee (MXN) ---
      'setup_advance': { price: 600,  currency: 'mxn', title: 'Adelanto 30% — Instalación' },
      'setup_balance': { price: 1399, currency: 'mxn', title: 'Liquidación Restante' },
      'setup_full':    { price: 1999, currency: 'mxn', title: 'Pago de Contado — Instalación' },
    } as const;
    
    const entry = MODULE_CATALOG[moduleId];
    if (!entry || entry.price <= 0) {
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



    // Redirigir post-pago según el tipo de compra
    const isTokenPurchase = moduleId.startsWith('tokens_');
    const postPaymentOrigin = isTokenPurchase
      ? origin + '/console/billing'
      : origin + '/console/store';
    const successUrl = `${postPaymentOrigin}?success=true&module=${moduleId}`;
    const cancelUrl = `${postPaymentOrigin}?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: entry.currency,
            product_data: {
              name: entry.title,
              description: `Pago único — ${entry.title}`,
            },
            unit_amount: Math.round(entry.price * 100), // Stripe expects cents/centavos
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
