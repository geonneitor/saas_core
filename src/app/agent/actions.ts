'use server';

import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { revalidatePath } from 'next/cache';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function createStripeConnectAccount() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No autorizado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, stripe_account_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'agent') {
      throw new Error('Solo los agentes pueden conectar su cuenta de Stripe');
    }

    let accountId = profile.stripe_account_id;

    // Si no tiene cuenta, crearla en Stripe
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
      
      accountId = account.id;

      // Guardar el ID en la DB
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    // Generar link de Onboarding
    const origin = process.env.NEXT_PUBLIC_ROOT_DOMAIN 
      ? `https://hq.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` 
      : 'http://localhost:3000'; // Fallback a localhost si es dev
      
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/agent`,
      return_url: `${origin}/agent`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  } catch (error: any) {
    console.error('[STRIPE CONNECT]', error);
    return { error: error.message };
  }
}
