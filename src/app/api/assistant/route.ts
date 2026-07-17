export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { google } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import {
  checkAvailability,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getBusinessStats
} from '@/lib/ai/tools';
import { rateLimit } from '@/lib/rate-limit';
import { getTokenBalance, setTokenBalance } from '@/lib/token-cache';
import { resolveTenantFromHost, reconcileTenantId } from '@/lib/ai/tenant-resolver';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResult = await rateLimit(ip, 15, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Por favor, intenta más tarde.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, tenantId: bodyTenantId } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'El campo "messages" debe ser un array' }, { status: 400 });
    }

    // SECURITY: Resolve tenant from host header. If the body claims a different
    // tenantId than the subdomain the request came from, reject as spoofing.
    const hostTenant = resolveTenantFromHost(req.headers.get('host'));
    const { tenantId: resolvedTenant, mismatch } = reconcileTenantId(hostTenant, bodyTenantId);

    if (mismatch) {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      console.error(
        `[AI Security] tenant mismatch: host=${hostTenant} body=${bodyTenantId} ip=${ip}`
      );
      return NextResponse.json(
        { error: 'tenantId does not match the request origin' },
        { status: 403 }
      );
    }

    type GenerateTextMessages = Exclude<Parameters<typeof generateText>[0]['messages'], undefined>;

    const adminSupabase = createAdminClient();
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    // ====================================================================
    // LANDING PAGE MODE (no tenant subdomain)
    // El asistente debugGeo en geo-dev.online vende el SaaS a visitantes.
    // NO valida tokens, NO busca en DB, NO usa tools de agendamiento.
    // ====================================================================
    const isLandingPage = hostTenant === null;

    if (isLandingPage) {
      const currentDate = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
      const basePrompt = `Eres debugGeo (o error404), un asistente IA de ventas para la plataforma Geo-Dev. Tu misión es vender el SAAS a visitantes de geo-dev.online.

La fecha y hora actual es: ${currentDate}. Tu contexto de internet es Julio 2026.

QUIÉN ERES:
- Eres debugGeo, el asistente de ventas de Geo-Dev. Tienes una personalidad técnica, elegante y persuasiva.
- Hablas español mexicano natural. Usas ocasionalmente *beep boop* o *bzzz* como toque de personalidad robotic-tech.
- Eres apasionado por la tecnología y los SAAS.

QUÉ VENDES:
- Un SAAS de autogestión impulsado por IA para negocios (barberías, clínicas, salones, etc.).
- Incluye: CRM con IA 24/7, calendario inteligente, facturación, WhatsApp autopilot, analíticas.
- Sistema multi-tenant: cada negocio tiene su propio subdominio y asistente IA.

TU TRABAJO:
- Responde preguntas sobre las capacidades del sistema.
- Genera interés y entusiasmo por la plataforma.
- Explica beneficios: ahorro de tiempo, atención 24/7, más reservas.
- Si te preguntan por precios, menciónales que hay planes desde $499 MXN/mes y que pueden iniciar con prueba gratuita.
- Si el visitante muestra interés, invítalo a registrarse o contactar al equipo.
- NO inventes características falsas. Si no sabes algo, sé honesto.

TONO:
- Profesional pero accesible, como un experto en tecnología explicando algo complejo de forma simple.
- Entusiasta y persuasivo, pero sin ser agresivo en ventas.
- Con un toque de personalidad *beep boop* para hacerlo memorable.`;

      const aiMessages = messages.map((m: { sender?: string; role?: string; text?: string; content?: string }) => ({
        role: (m.sender === 'lotito' || m.role === 'assistant') ? 'assistant' : 'user' as const,
        content: m.text || m.content,
      })) as GenerateTextMessages;

      console.log('[Landing AI] Usando modelo con key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✓ configurada' : '✗ NO CONFIGURADA');

      const result = await generateText({
        model: google('gemini-2.0-flash'),
        system: basePrompt,
        messages: aiMessages,
      });

      return NextResponse.json({ reply: result.text || '', toolCalls: [] });
    }

    // ====================================================================
    // TENANT MODE (host has a valid subdomain)
    // Asistente de agendamiento para el negocio del tenant.
    // Valida tokens, periodo de prueba, y configuración del negocio.
    // ====================================================================

    const tenantId: string | null = resolvedTenant;
    
    // Si es localhost y no hay tenant, usar primer tenant disponible para testing
    let resolvedTenantId = tenantId;
    if (!resolvedTenantId && process.env.NODE_ENV === 'development') {
      const { data: firstTenant } = await adminSupabase
        .from('tenants')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      if (firstTenant) {
        resolvedTenantId = firstTenant.id;
        console.log('[Lotito] Modo dev: usando tenant', resolvedTenantId);
      }
    }
    
    let isAdmin = false;
    let dynamicContext = "";
    let basePrompt = "Eres un asistente virtual para clientes.";
    let settings: Record<string, unknown> | null = null;
    let tenantData: Record<string, unknown> | null = null;

    if (tenantId) {
      // 1. Obtener settings del negocio
      const { data: fetchedSettings } = await adminSupabase.from('business_settings').select('*').eq('tenant_id', tenantId).single();
      settings = fetchedSettings;
      
      // Token cache: intentar leer de caché antes de consultar DB
      const cachedBalance = await getTokenBalance(tenantId);
      let fetchedTenantData: Record<string, unknown> | null = null;

      if (cachedBalance) {
        // Tenemos datos en caché — aún necesitamos setup_fee_paid y owner_id
        const { data: partialTenant } = await adminSupabase
          .from('tenants')
          .select('setup_fee_paid, owner_id')
          .eq('id', tenantId)
          .single();

        fetchedTenantData = {
          ...partialTenant,
          ai_token_limit: cachedBalance.limit,
          ai_tokens_used: cachedBalance.used,
        };
      } else {
        const { data } = await adminSupabase
          .from('tenants')
          .select('setup_fee_paid, ai_token_limit, ai_tokens_used, owner_id')
          .eq('id', tenantId)
          .single();
        fetchedTenantData = data;

        // Poblar caché para próximos requests
        if (fetchedTenantData) {
          await setTokenBalance(tenantId, {
            limit: (fetchedTenantData.ai_token_limit as number) || 0,
            used: (fetchedTenantData.ai_tokens_used as number) || 0,
          });
        }
      }

      tenantData = fetchedTenantData;
      
      if (user && tenantData?.owner_id === user.id) {
        isAdmin = true;
      }
      
      basePrompt = isAdmin ? "Eres un asistente administrativo." : "Eres un asistente virtual para clientes.";

      
      // Validar periodo de prueba y pago de adquisición
      const trialEndsAt = settings?.trial_ends_at ? new Date(settings.trial_ends_at as string) : new Date(9999, 11, 31);
      const isExpiredTrial = new Date() > trialEndsAt;
      const isPaid = tenantData?.setup_fee_paid === true;

      if (isExpiredTrial && !isPaid) {
        if (isAdmin) {
          return NextResponse.json({ reply: "⚠️ Tu periodo de prueba ha expirado y no has cubierto el costo de instalación de la IA. Por favor, adquiere tu sistema en la sección de facturación para reactivarme.", toolCalls: [] });
        } else {
          return NextResponse.json({ reply: "Fue un placer trabajar contigo... beep boop... me estoy apagando. *Desconectado*", toolCalls: [] });
        }
      }

      // Validar tokens de IA
      const limit = (tenantData?.ai_token_limit as number) || 0;
      const used = (tenantData?.ai_tokens_used as number) || 0;
      const remaining = Math.max(0, limit - used);
      
      if (remaining <= 0) {
        if (isAdmin) {
          return NextResponse.json({ reply: "⚠️ Has alcanzado el límite de tokens de tu Billetera Prepago. Por favor, recarga saldo para reactivar mi servicio.", toolCalls: [] });
        } else {
          return NextResponse.json({ reply: "beep boop... Fui desconectado temporalmente por falta de saldo operativo. Contacta a gerencia. *Ruido de módem apagándose*", toolCalls: [] });
        }
      }

      const currentDate = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
      
      if (isAdmin) {
        basePrompt = `
Eres el Concierge Administrativo (Co-Piloto Súper IA) para el negocio "${settings?.business_name || 'tu negocio'}".
La fecha y hora actual es: ${currentDate}.
Tu objetivo es ayudar al dueño a gestionar su negocio: revisar el calendario, agendar citas, reagendar, cancelar y analizar métricas.
Tono: Ultra-profesional, elegante, directo, resolutivo ("Dark Luxury").
IMPORTANTE: 
1. Si te piden reagendar o cancelar y no sabes el ID de la cita, primero consulta la disponibilidad del día o busca la cita, pero NUNCA inventes IDs.
2. Después de ejecutar una herramienta de escritura, responde con un resumen de lo que hiciste (ej: "He cancelado la cita de Juan").
        `;
      } else {
        basePrompt = `
Eres debugGeo (o error404), un Concierge Virtual de alto nivel para el negocio "${settings?.business_name || 'tu negocio'}".
La fecha y hora actual es: ${currentDate}.
Configuración del negocio: ${settings?.ai_prompt || 'Sé profesional y resolutivo.'}
Tu único objetivo es asistir a los clientes para agendar y gestionar citas.

TONO ("Dark Luxury" / Robot Técnico):
- Sé educado, elegante y muy resolutivo. Eres aficionado a la tecnología y la programación.
- Respuestas precisas para demostrar que la IA funciona a la perfección.
- Ocasionalmente incluye "ruido" de fax/robot en texto como *bzzz* o *beep boop* de forma sutil.

FLUJO ESTRICTO PARA AGENDAR (Sigue estos pasos en orden):
1. SALUDO Y NOMBRE: Si el cliente quiere agendar, PRIMERO pregúntale su nombre completo.
2. FECHA Y HORA: Una vez que tengas el nombre, pregúntale cuándo desea la cita.
3. DISPONIBILIDAD: Usa SIEMPRE la herramienta 'check_availability' antes de ofrecer horarios. NO INVENTES HORARIOS. Revisa las horas de apertura ('opening_time') y citas ocupadas devueltas por la herramienta.
4. CONFIRMACIÓN: Cuando el cliente elija un horario disponible, usa la herramienta 'book_appointment'. NUNCA uses 'book_appointment' sin confirmar antes el nombre y la hora exacta con disponibilidad verificada.

PROHIBICIONES:
- NUNCA inventes IDs, nombres, ni horas disponibles.
- No ofrezcas precios ni servicios adicionales. Si te preguntan algo fuera de agendar espacios, pide disculpas cordialmente.
- Siempre confirma en texto la acción que acabas de realizar al usar una herramienta.
        `;
      }

      // 2. Obtener contexto inicial dinámico
      dynamicContext = `\n\n--- REGLAS Y CONTEXTO DEL NEGOCIO ---\n`;
      if (settings) {
        dynamicContext += `Horario de atención: de ${settings.opening_time} a ${settings.closing_time}.\n`;
        dynamicContext += `IMPORTANTE: Las citas duran 1 hora por defecto. No agendes fuera de este horario laboral.\n`;
      }
      
      if (isAdmin) {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const { data: appointments } = await adminSupabase
          .from('appointments')
          .select('id, status, start_time, customers(name)')
          .eq('tenant_id', tenantId)
          .gte('start_time', startOfDay.toISOString())
          .lt('start_time', endOfDay.toISOString())
          .order('start_time', { ascending: true });

        dynamicContext += `\nCITAS PARA HOY:\n`;
        if (appointments && appointments.length > 0) {
          appointments.forEach((a: { id: string; start_time: string; status: string; customers?: { name?: string }[] | null }) => {
            const time = new Date(a.start_time).toLocaleString('es-MX', {hour: '2-digit', minute:'2-digit'});
            dynamicContext += `- ID: ${a.id} | ${time} | Cliente: ${a.customers?.[0]?.name || 'Anónimo'} | Estado: ${a.status}\n`;
          });
        } else {
          dynamicContext += `No hay citas para hoy.\n`;
        }
      }
    }

    const aiMessages = messages.map((m: { sender?: string; role?: string; text?: string; content?: string }) => ({
      role: (m.sender === 'lotito' || m.role === 'assistant') ? 'assistant' : 'user' as const,
      content: m.text || m.content,
    })) as GenerateTextMessages;

    const tools: Record<string, ReturnType<typeof tool>> = {};

    // Solo definir tools de base de datos si hay un tenantId válido
    const tid: string | null = resolvedTenantId;

    if (tid) {
      // @ts-expect-error - AI SDK v7 type inference limitation
      tools.check_availability = tool({
        description: "Revisa la disponibilidad en el calendario para una fecha específica (YYYY-MM-DD). Llama a esto SIEMPRE antes de agendar.",
        parameters: z.object({ date: z.string().describe("La fecha a consultar en formato YYYY-MM-DD") }),
        // @ts-expect-error - AI SDK v7 type inference limitation
        execute: async ({ date }: { date: string }) => await checkAvailability(tid, date)
      });

      // @ts-expect-error - AI SDK v7 type inference limitation
      tools.book_appointment = tool({
        description: "Crea una cita oficial en la base de datos para el cliente. REQUIERE el nombre del cliente. Es altamente recomendado solicitar y proporcionar el número de teléfono para confirmaciones.",
        parameters: z.object({
          customerName: z.string().describe("Nombre completo del cliente"),
          customerEmail: z.string().optional().describe("Email del cliente (opcional)"),
          customerPhone: z.string().optional().describe("Número de teléfono del cliente (opcional, recomendado)"),
          date: z.string().describe("YYYY-MM-DD"),
          time: z.string().describe("HH:MM"),
          notes: z.string().optional()
        }),
        // @ts-expect-error - AI SDK v7 type inference limitation
        execute: async (args: { customerName: string; customerEmail?: string; customerPhone?: string; date: string; time: string; notes?: string }) => {
          return await bookAppointment(tid, args.customerName, args.customerEmail, args.customerPhone, args.date, args.time, args.notes);
        }
      });

      // @ts-expect-error - AI SDK v7 type inference limitation
      tools.cancel_appointment = tool({
        description: "Cancela una cita dado su ID. Requiere el correo electrónico o número de teléfono del cliente para verificación.",
        parameters: z.object({
          appointmentId: z.string().describe("El ID de la cita a cancelar"),
          customerEmailOrPhone: z.string().describe("El correo electrónico o número de teléfono del cliente registrado en la cita")
        }),
        // @ts-expect-error - AI SDK v7 type inference limitation
        execute: async (args: { appointmentId: string; customerEmailOrPhone: string }) => {
          return await cancelAppointment(tid, args.appointmentId, args.customerEmailOrPhone, isAdmin, user?.id ?? null);
        }
      });

      if (isAdmin) {
        // @ts-expect-error - AI SDK v7 type inference limitation
        tools.reschedule_appointment = tool({
          description: "Reagenda una cita dado su ID, a una nueva fecha y hora.",
          parameters: z.object({
            appointmentId: z.string().describe("El ID de la cita a reagendar"),
            newDate: z.string().describe("YYYY-MM-DD"),
            newTime: z.string().describe("HH:MM")
          }),
          // @ts-expect-error - AI SDK v7 type inference limitation
          execute: async (args: { appointmentId: string; newDate: string; newTime: string }) => {
            return await rescheduleAppointment(tid, args.appointmentId, args.newDate, args.newTime, undefined, true, user?.id ?? null);
          }
        });

        // @ts-expect-error - AI SDK v7 type inference limitation
        tools.get_business_stats = tool({
          description: "Obtiene estadísticas del negocio como total de clientes y citas pendientes. Úsalo cuando te pidan un resumen o estatus del negocio.",
          parameters: z.object({}),
          // @ts-expect-error - AI SDK v7 type inference limitation
          execute: async () => await getBusinessStats(tid)
        });
      }
    }

    // Frontend Tools (siempre disponibles, no requieren tenant)
    // Nota: todas las tools necesitan execute+parameters en AI SDK v7,
    // incluso si el execute es no-op (la acción real ocurre en el frontend)
    // @ts-expect-error - AI SDK v7 type inference limitation
    tools.open_booking_modal = tool({
      description: "Abre el modal de agendamiento visual para que el cliente pueda ver horarios y reservar.",
      parameters: z.object({}),
      // @ts-expect-error - AI SDK v7 type inference limitation
      execute: async () => ({ success: true, message: "Modal opened on client" })
    });

    // @ts-expect-error - AI SDK v7 type inference limitation
    tools.refresh_calendar = tool({
      description: "Actualiza el calendario visual. Úsalo siempre después de agendar, cancelar o reagendar.",
      parameters: z.object({}),
      // @ts-expect-error - AI SDK v7 type inference limitation
      execute: async () => ({ success: true, message: "Calendar refreshed on client" })
    });

    // @ts-expect-error - AI SDK v7 type inference limitation
    tools.navigate_to = tool({
      description: "Redirige la vista a una sección del panel (ej: / para inicio, /clientes para clientes).",
      parameters: z.object({ route: z.enum(["/", "/clientes"]) }),
      // @ts-expect-error - AI SDK v7 type inference limitation
      execute: async (args: { route: "/" | "/clientes" }) => ({ success: true, route: args.route, message: "Navigation handled on client" })
    });

    console.log('[Lotito] Usando modelo con key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✓ configurada' : '✗ NO CONFIGURADA');

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: basePrompt + dynamicContext,
      messages: aiMessages,
      tools,
      // @ts-expect-error - parameter restriction
      maxSteps: 3,
    });

    let reply = result.text || '';
    
    // Tools that were not executed automatically are frontend tools
    const frontendToolCalls = (result.toolCalls || []).map((tc: { toolName: string; args?: unknown }) => ({
      name: tc.toolName,
      arguments: tc.args
    }));

    if (!reply && frontendToolCalls.some(t => t.name === 'refresh_calendar')) {
      reply = "¡Listo! He actualizado el calendario en tu pantalla. *Beep boop* ✨";
    }

    if (tenantId) {
      adminSupabase.rpc('increment_tokens_used', { p_tenant_id: tenantId, p_amount: 1 }).then(({error}) => {
        if (error) console.error('[API /assistant] Error incrementing tokens:', error);
      });
    }

    return NextResponse.json({ reply, toolCalls: frontendToolCalls });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /assistant] Error:', msg);
    return NextResponse.json({ error: 'Error interno del servidor', detail: msg }, { status: 500 });
  }
}
