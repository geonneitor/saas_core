export const runtime = 'edge';
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
    const { messages, tenantId } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'El campo "messages" debe ser un array' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    let isAdmin = false;
    let dynamicContext = "";
    let basePrompt = "Eres un asistente virtual para clientes.";
    let settings: any = null;
    let tenantData: any = null;

    if (tenantId) {
      // 1. Obtener settings del negocio
      const { data: fetchedSettings } = await adminSupabase.from('business_settings').select('*').eq('tenant_id', tenantId).single();
      settings = fetchedSettings;
      
      const { data: fetchedTenantData } = await adminSupabase.from('tenants').select('setup_fee_paid, ai_token_limit, ai_tokens_used, owner_id').eq('id', tenantId).single();
      tenantData = fetchedTenantData;
      
      if (user && tenantData?.owner_id === user.id) {
        isAdmin = true;
      }
      
      basePrompt = isAdmin ? "Eres un asistente administrativo." : "Eres un asistente virtual para clientes.";

      
      // Validar periodo de prueba y pago de adquisición
      const trialEndsAt = settings?.trial_ends_at ? new Date(settings.trial_ends_at) : new Date(9999, 11, 31);
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
      const limit = tenantData?.ai_token_limit || 0;
      const used = tenantData?.ai_tokens_used || 0;
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
          appointments.forEach((a: any) => {
            const time = new Date(a.start_time).toLocaleString('es-MX', {hour: '2-digit', minute:'2-digit'});
            dynamicContext += `- ID: ${a.id} | ${time} | Cliente: ${a.customers?.name || 'Anónimo'} | Estado: ${a.status}\n`;
          });
        } else {
          dynamicContext += `No hay citas para hoy.\n`;
        }
      }
    }

    const aiMessages: any[] = messages.map((m: any) => ({
      role: (m.sender === 'lotito' || m.role === 'assistant') ? 'assistant' : 'user',
      content: m.text || m.content,
    }));

    const tools: Record<string, any> = {};

    tools.check_availability = tool({
      description: "Revisa la disponibilidad en el calendario para una fecha específica (YYYY-MM-DD). Llama a esto SIEMPRE antes de agendar.",
      parameters: z.object({ date: z.string().describe("La fecha a consultar en formato YYYY-MM-DD") }),
      // @ts-ignore
      execute: async ({ date }) => await checkAvailability(tenantId, date)
    });

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
      // @ts-ignore
      execute: async ({ customerName, customerEmail, customerPhone, date, time, notes }) => {
        return await bookAppointment(tenantId, customerName, customerEmail, customerPhone, date, time, notes);
      }
    });

    tools.cancel_appointment = tool({
      description: "Cancela una cita dado su ID. Requiere el correo electrónico o número de teléfono del cliente para verificación.",
      parameters: z.object({ 
        appointmentId: z.string().describe("El ID de la cita a cancelar"),
        customerEmailOrPhone: z.string().describe("El correo electrónico o número de teléfono del cliente registrado en la cita")
      }),
      // @ts-ignore
      execute: async ({ appointmentId, customerEmailOrPhone }) => {
        return await cancelAppointment(tenantId, appointmentId, customerEmailOrPhone, isAdmin);
      }
    });

    if (isAdmin) {
      tools.reschedule_appointment = tool({
        description: "Reagenda una cita dado su ID, a una nueva fecha y hora.",
        parameters: z.object({
          appointmentId: z.string().describe("El ID de la cita a reagendar"),
          newDate: z.string().describe("YYYY-MM-DD"),
          newTime: z.string().describe("HH:MM")
        }),
        // @ts-ignore
        execute: async ({ appointmentId, newDate, newTime }) => {
          return await rescheduleAppointment(tenantId, appointmentId, newDate, newTime, undefined, true);
        }
      });

      tools.get_business_stats = tool({
        description: "Obtiene estadísticas del negocio como total de clientes y citas pendientes. Úsalo cuando te pidan un resumen o estatus del negocio.",
        parameters: z.object({}),
        // @ts-ignore
        execute: async () => await getBusinessStats(tenantId)
      });

      tools.navigate_to = tool({
        description: "Navega y redirige a una sección específica del calendario o panel.",
        // @ts-ignore
        parameters: z.object({ route: z.enum(["/", "/clientes"]) })
      });
    }

    // Frontend Tool
    tools.refresh_calendar = tool({
      description: "Actualiza el calendario visual. Úsalo siempre después de agendar, cancelar o reagendar.",
      // @ts-ignore
      parameters: z.object({})
    });

    const result = await generateText({
      model: google('gemini-1.5-flash'),
      system: basePrompt + dynamicContext,
      messages: aiMessages,
      tools,
      // @ts-ignore
      maxSteps: 3,
    });

    let reply = result.text || '';
    
    // Tools that were not executed automatically are frontend tools
    const frontendToolCalls = (result.toolCalls || []).map((tc: any) => ({
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
  } catch (error: any) {
    console.error('[API /assistant] Error:', error.message, error.stack);
    return NextResponse.json({ error: 'Error interno del servidor', detail: error.message }, { status: 500 });
  }
}
