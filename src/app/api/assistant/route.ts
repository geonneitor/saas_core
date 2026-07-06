import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  checkAvailability,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getBusinessStats
} from '@/lib/ai/tools';

const TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "Navega y redirige a una sección específica del calendario o panel.",
      parameters: {
        type: "object",
        properties: { route: { type: "string", enum: ["/", "/clientes"] } },
        required: ["route"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "Revisa la disponibilidad en el calendario para una fecha específica (YYYY-MM-DD). Llama a esto SIEMPRE antes de agendar para asegurarte de que haya espacio y esté dentro del horario de apertura.",
      parameters: {
        type: "object",
        properties: { 
          date: { type: "string", description: "La fecha a consultar en formato YYYY-MM-DD" }
        },
        required: ["date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Crea una cita oficial en la base de datos para el cliente. REQUIERE el nombre del cliente.",
      parameters: {
        type: "object",
        properties: { 
          customerName: { type: "string", description: "Nombre completo del cliente" }, 
          customerEmail: { type: "string", description: "Email del cliente (opcional, usar si lo da)" },
          date: { type: "string", description: "YYYY-MM-DD" },
          time: { type: "string", description: "HH:MM" },
          notes: { type: "string" }
        },
        required: ["customerName", "date", "time"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description: "Cancela una cita dado su ID.",
      parameters: {
        type: "object",
        properties: {
          appointmentId: { type: "string", description: "El ID de la cita a cancelar" }
        },
        required: ["appointmentId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reschedule_appointment",
      description: "Reagenda una cita dado su ID, a una nueva fecha y hora.",
      parameters: {
        type: "object",
        properties: {
          appointmentId: { type: "string", description: "El ID de la cita a reagendar" },
          newDate: { type: "string", description: "YYYY-MM-DD" },
          newTime: { type: "string", description: "HH:MM" }
        },
        required: ["appointmentId", "newDate", "newTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_business_stats",
      description: "Obtiene estadísticas del negocio como total de clientes y citas pendientes. Úsalo cuando te pidan un resumen, consejo o estatus del negocio.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "refresh_calendar",
      description: "Actualiza el calendario visual. Úsalo siempre después de agendar, cancelar o reagendar.",
      parameters: { type: "object", properties: {} }
    }
  }
];

const BACKEND_TOOL_NAMES = new Set([
  'check_availability',
  'book_appointment',
  'cancel_appointment',
  'reschedule_appointment',
  'get_business_stats'
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, tenantId, isAdmin } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'El campo "messages" debe ser un array' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let dynamicContext = "";
    let basePrompt = isAdmin ? "Eres un asistente administrativo." : "Eres un asistente virtual para clientes.";
    let settings: any = null;
    let allowedToolNames = isAdmin 
      ? ['check_availability', 'book_appointment', 'cancel_appointment', 'reschedule_appointment', 'get_business_stats', 'refresh_calendar', 'navigate_to']
      : ['check_availability', 'book_appointment', 'cancel_appointment', 'refresh_calendar'];

    if (tenantId) {
      // 1. Obtener settings del negocio
      const { data } = await supabase.from('business_settings').select('*').eq('tenant_id', tenantId).single();
      settings = data;
      
      // Validar tokens de IA
      const limit = settings?.ai_tokens_limit || 0;
      const used = settings?.ai_tokens_used || 0;
      
      if (used >= limit) {
        if (isAdmin) {
          return NextResponse.json({ reply: "⚠️ Has alcanzado el límite de tokens de IA de tu plan. Actualiza tu suscripción en la sección de Facturación para reactivar a tu asistente.", toolCalls: [] });
        } else {
          return NextResponse.json({ reply: "El servicio de asistencia virtual no está disponible temporalmente. Por favor, contacte directamente al negocio.", toolCalls: [] });
        }
      }

      const currentDate = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
      
      if (isAdmin) {
        basePrompt = `
Eres el Concierge Administrativo (Co-Piloto Súper IA) para el negocio "${settings?.business_name || 'tu negocio'}".
La fecha y hora actual es: ${currentDate}.
Tu objetivo es ayudar al dueño a gestionar su negocio: revisar el calendario, agendar citas, reagendar, cancelar y analizar métricas (usando get_business_stats).
Tono: Ultra-profesional, elegante, directo, resolutivo ("Dark Luxury").
IMPORTANTE: 
1. Si te piden reagendar o cancelar y no sabes el ID de la cita, primero consulta la disponibilidad del día o busca la cita, pero NUNCA inventes IDs.
2. Después de ejecutar una herramienta de escritura, responde con un resumen de lo que hiciste (ej: "He cancelado la cita de Juan").
        `;
      } else {
        basePrompt = `
Eres el Concierge Virtual de alto nivel para el negocio "${settings?.business_name || 'tu negocio'}".
La fecha actual es: ${currentDate}.
Configuración del negocio: ${settings?.ai_prompt || 'Sé profesional y resolutivo.'}
Tu objetivo es asistir a los clientes para agendar, revisar y cancelar citas.
No inventes precios ni servicios. Si te preguntan algo fuera de agendar espacios, pide disculpas cordialmente.

TONO ("Dark Luxury"):
- Sé extremadamente educado, elegante, y conciso.
- Evita el exceso de entusiasmo (nada de "¡Hola! ¡Claro que sí!").
- Usa frases como: "Será un placer asistirle.", "Con gusto agendaré su espacio."

REGLA CRÍTICA PARA AGENDAR (Tool: book_appointment):
NUNCA ejecutes la tool 'book_appointment' sin tener el NOMBRE del cliente y una HORA acordada válida.
Si el cliente solo dice "Quiero una cita mañana", primero revisa la disponibilidad (check_availability) y ofrécele horarios dentro de la franja. Luego pídele su nombre para confirmar.

IMPORTANTE: Después de ejecutar una tool, responde confirmando al cliente la acción realizada.
        `;
      }

      // 2. Obtener contexto inicial dinámico
      dynamicContext = `\n\n--- REGLAS Y CONTEXTO DEL NEGOCIO ---\n`;
      if (settings) {
        dynamicContext += `Horario de atención: de ${settings.opening_time} a ${settings.closing_time}.\n`;
        dynamicContext += `IMPORTANTE: Las citas duran 1 hora por defecto. No agendes fuera de este horario laboral.\n`;
      }
      
      if (isAdmin) {
        // Le pasamos las citas de hoy por defecto para que las tenga sin buscar si le preguntan rápido
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const { data: appointments } = await supabase
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

    let groqMessages: any[] = [
      { role: 'system', content: basePrompt + dynamicContext },
      ...messages.map((m: any) => ({
        role: m.sender === 'lotito' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text || m.content,
      })),
    ];

    async function callGroq(msgs: any[]) {
      const apiKey = settings?.groq_api_key?.trim() || process.env.GROQ_API_KEY?.trim();
      
      if (!apiKey) {
        throw new Error('GROQ_API_KEY no configurada (ni en .env ni en business_settings.groq_api_key del tenant)');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: msgs,
          temperature: 0.3,
          max_tokens: 400,
          tools: TOOLS.filter(t => allowedToolNames.includes(t.function.name)),
          tool_choice: "auto"
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errBody}`);
      }
      return response.json();
    }

    let data = await callGroq(groqMessages);
    let messageObj = data.choices[0].message;
    let reply = messageObj.content || '';
    let frontendToolCalls: any[] = [];

    // Bucle de Tool Calling
    if (messageObj.tool_calls) {
      const backendTools = messageObj.tool_calls.filter((tc: any) => BACKEND_TOOL_NAMES.has(tc.function.name));
      const otherTools = messageObj.tool_calls.filter((tc: any) => !BACKEND_TOOL_NAMES.has(tc.function.name));

      frontendToolCalls = otherTools.map((tc: any) => ({
        name: tc.function.name,
        arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
      }));

      // Ejecutar funciones locales si hay backendTools
      if (backendTools.length > 0 && tenantId) {
        groqMessages.push(messageObj); 
        
        for (const tc of backendTools) {
          try {
            const args = JSON.parse(tc.function.arguments);
            
            if (tc.function.name === 'check_availability') {
              const res = await checkAvailability(tenantId, args.date);
              groqMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: JSON.stringify(res)
              });
            }

            if (tc.function.name === 'book_appointment') {
              const res = await bookAppointment(tenantId, args.customerName, args.customerEmail, args.date, args.time, args.notes);
              groqMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: JSON.stringify(res)
              });
              // Si agendamos, obligamos al frontend a refrescar
              if (res.success && !frontendToolCalls.some(t => t.name === 'refresh_calendar')) {
                frontendToolCalls.push({ name: 'refresh_calendar', arguments: {} });
              }
            }

            if (tc.function.name === 'cancel_appointment') {
              const res = await cancelAppointment(tenantId, args.appointmentId);
              groqMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: JSON.stringify(res)
              });
              if (res.success && !frontendToolCalls.some(t => t.name === 'refresh_calendar')) {
                frontendToolCalls.push({ name: 'refresh_calendar', arguments: {} });
              }
            }

            if (tc.function.name === 'reschedule_appointment') {
              const res = await rescheduleAppointment(tenantId, args.appointmentId, args.newDate, args.newTime);
              groqMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: JSON.stringify(res)
              });
              if (res.success && !frontendToolCalls.some(t => t.name === 'refresh_calendar')) {
                frontendToolCalls.push({ name: 'refresh_calendar', arguments: {} });
              }
            }

            if (tc.function.name === 'get_business_stats') {
              const res = await getBusinessStats(tenantId);
              groqMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: JSON.stringify(res)
              });
            }

          } catch (e) {
             groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: 'Error ejecutando herramienta' });
          }
        }
        
        // Segunda llamada a Groq con los resultados de las herramientas
        data = await callGroq(groqMessages);
        messageObj = data.choices[0].message;
        reply = messageObj.content || reply;
        
        // Capturar tool_calls adicionales de frontend que Groq pueda escupir en la 2da vuelta
        if (messageObj.tool_calls) {
          const secondFrontendTools = messageObj.tool_calls
            .filter((t: any) => !BACKEND_TOOL_NAMES.has(t.function.name))
            .map((t: any) => ({
              id: t.id,
              name: t.function.name,
              arguments: JSON.parse(t.function.arguments)
            }));
          
          secondFrontendTools.forEach((st: any) => {
             if (!frontendToolCalls.some(ft => ft.name === st.name)) {
                frontendToolCalls.push(st);
             }
          });
        }
      }
    }

    if (!reply) {
      if (frontendToolCalls.some((t: any) => t.name === 'refresh_calendar')) {
        reply = "¡Listo! He actualizado el calendario. ✨";
      } else {
        reply = "Hecho. ✨";
      }
    }

    if (tenantId) {
      // Incrementar tokens usados de manera asíncrona
      const used = settings?.ai_tokens_used || 0;
      supabase.from('business_settings').update({ ai_tokens_used: used + 1 }).eq('tenant_id', tenantId).then(({error}) => {
        if (error) console.error('[API /assistant] Error incrementing tokens:', error);
      });
    }

    return NextResponse.json({ reply, toolCalls: frontendToolCalls });
  } catch (error: any) {
    console.error('[API /assistant] Error:', error.message, error.stack);
    return NextResponse.json({ error: 'Error interno del servidor', detail: error.message }, { status: 500 });
  }
}
