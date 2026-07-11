import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK] Error de firma: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const tenantId = session.metadata?.tenantId;
    const moduleId = session.metadata?.moduleId;

    if (tenantId && moduleId) {
      const supabase = createAdminClient();
      
      // 1. Obtener los módulos actuales del inquilino
      const { data: tenant } = await supabase
        .from('tenants')
        .select('active_modules, ai_tokens_used, ai_token_limit')
        .eq('id', tenantId)
        .single();
        
      if (tenant) {
        // Manejar compras de tokens vs Módulos
        if (moduleId.startsWith('tokens_')) {
          const tokenAmount = moduleId === 'tokens_10k' ? 10000 : moduleId === 'tokens_50k' ? 50000 : 200000;
          
          await supabase
            .from('tenants')
            .update({ 
              ai_token_limit: (tenant.ai_token_limit || 0) + tokenAmount 
            })
            .eq('id', tenantId);
            
        } else {
          // Desbloquear módulo
          let currentModules = tenant.active_modules || ['core'];
          if (!currentModules.includes(moduleId)) {
            currentModules.push(moduleId);
            
            await supabase
              .from('tenants')
              .update({ active_modules: currentModules })
              .eq('id', tenantId);
          }
        }
        
        console.log(`[STRIPE WEBHOOK] Desbloqueado ${moduleId} para Tenant ${tenantId}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
