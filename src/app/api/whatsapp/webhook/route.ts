import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// [16726] Implementación del Webhook de WhatsApp (Sprint 4)
// Por qué: Integrar agendamiento autónomo vía mensajería directa (Meta API).
// Cómo:
//   1. GET → Verificación con Meta (hub.verify_token)
//   2. POST → Persiste en wa_inbox vía RPC + responde 200 inmediato
//   3. Procesamiento async: Vercel Cron Job o worker recoje 'pending'
//
// Meta requiere status 200 en < 20 segundos o reintenta.

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'saas_core_wa_verify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verificado correctamente');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificación estructural del evento de Meta
    if (body.object === 'whatsapp_business_account') {
      const supabase = createAdminClient();
      const results: { messageId?: string; status: string }[] = [];

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            for (const message of change.value.messages) {
              const senderPhone = message.from;
              const receiverPhone = change.value.metadata.display_phone_number;
              const text = message.text?.body || '';
              const messageType = message.type || 'text';

              console.log(
                `[WhatsApp] Mensaje recibido: de=${senderPhone} para=${receiverPhone} texto="${text.slice(0, 80)}"`
              );

              // Usar RPC atómico: busca tenant por número + inserta en wa_inbox
              // Esto mantiene la transacción segura (service_role) y rápida.
              const { data: inboxId, error: rpcError } = await supabase.rpc(
                'wa_receive_message',
                {
                  p_sender_phone: senderPhone,
                  p_receiver_phone: receiverPhone,
                  p_message_text: text,
                  p_message_type: messageType,
                  p_raw_payload: message,
                }
              );

              if (rpcError) {
                // TENANT_NOT_FOUND es esperable si el número no está registrado
                if (rpcError.message?.includes('TENANT_NOT_FOUND')) {
                  console.warn(
                    `[WhatsApp] Número ${receiverPhone} no registrado como whatsapp_number de ningún tenant. Ignorando.`
                  );
                  results.push({ status: 'ignored_no_tenant' });
                } else {
                  console.error('[WhatsApp] Error RPC wa_receive_message:', rpcError);
                  results.push({ status: 'error', messageId: undefined });
                }
              } else {
                console.log(`[WhatsApp] Mensaje persistido en wa_inbox: ${inboxId}`);
                results.push({ status: 'queued', messageId: inboxId });
              }
            }
          }
        }
      }

      // SIEMPRE responder 200 aunque algún mensaje falle individualmente
      // Meta interpreta cualquier otro status como fallo y reintenta.
      return NextResponse.json({
        success: true,
        results,
      });
    }

    return NextResponse.json({ error: 'Evento no reconocido' }, { status: 400 });
  } catch (error: unknown) {
    // Log completo pero responder 200 para evitar bucles de reintento de Meta
    console.error('[WhatsApp Error]', error);
    return NextResponse.json(
      { success: true, warning: 'Error procesado, se retornó 200 para evitar reintentos' }
    );
  }
}
