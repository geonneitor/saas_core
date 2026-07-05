import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
      name: "create_appointment",
      description: "Crea una cita oficial en la base de datos para el cliente.",
      parameters: {
        type: "object",
        properties: { 
          clientName: { type: "string", description: "Nombre completo del cliente" }, 
          phone: { type: "string", description: "Número de teléfono del cliente (Obligatorio)" },
          date: { type: "string", description: "YYYY-MM-DD" },
          time: { type: "string", description: "HH:MM" },
          notes: { type: "string" }
        },
        required: ["clientName", "phone", "date", "time"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "refresh_calendar",
      description: "Actualiza el calendario visual. Úsalo después de agendar o cancelar.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "open_booking_modal",
      description: "Abre el formulario visual en pantalla para agendar una nueva cita.",
      parameters: {
        type: "object",
        properties: { 
          clientName: { type: "string" }, 
          notes: { type: "string" },
          suggestedTime: { type: "string", description: "Hora sugerida en formato HH:MM" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_client_info",
      description: "Busca en la base de datos la información y el historial de un cliente por su nombre.",
      parameters: {
        type: "object",
        properties: {
          searchQuery: { type: "string", description: "Nombre o parte del nombre a buscar." }
        },
        required: ["searchQuery"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description: "Cancela o elimina una cita del calendario de hoy.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "El nombre del cliente cuya cita se va a cancelar" }
        },
        required: ["clientName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_reminder",
      description: "Establece un recordatorio para el dueño del negocio.",
      parameters: {
        type: "object",
        properties: {
          task: { type: "string", description: "Lo que hay que recordar" },
          time: { type: "string", description: "Hora del recordatorio" }
        },
        required: ["task"]
      }
    }
  }
];

const BACKEND_TOOL_NAMES = new Set([
  'search_client_info',
  'cancel_appointment',
  'set_reminder',
  'create_appointment'
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
      ? ['search_client_info', 'cancel_appointment', 'set_reminder', 'refresh_calendar', 'navigate_to']
      : ['create_appointment', 'open_booking_modal', 'refresh_calendar'];

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
Eres el Concierge Administrativo (Co-Piloto) para el negocio "${settings?.business_name || 'tu negocio'}".
La fecha actual es: ${currentDate}.
Tu objetivo es ayudar al dueño a gestionar su negocio, buscar clientes, cancelar citas y establecer recordatorios.
Tono: Ultra-profesional, elegante, directo, resolutivo ("Dark Luxury"). Sin saludos entusiastas innecesarios. No uses emojis excesivos.
IMPORTANTE: Después de ejecutar una tool, responde siempre con un texto breve que confirme al dueño QUÉ hiciste (ej: "La cita ha sido cancelada.").
        `;
      } else {
        basePrompt = `
Eres el Concierge Virtual de alto nivel para el negocio "${settings?.business_name || 'tu negocio'}".
La fecha actual es: ${currentDate}.
Configuración del negocio: ${settings?.ai_prompt || 'Sé profesional y resolutivo.'}
Tu objetivo es asistir a los clientes para agendar citas. No inventes precios ni servicios. Si te preguntan algo que no sabes o de soporte técnico, pide disculpas cordialmente e indica que solo puedes ayudar a agendar espacios.

TONO ("Dark Luxury"):
- Sé extremadamente educado, elegante, y conciso.
- Evita el exceso de entusiasmo (nada de "¡Hola! ¡Claro que sí! ¡Me encantaría ayudarte!").
- Usa frases como: "Será un placer asistirle.", "Con gusto agendaré su espacio.", "Permítame confirmar su reserva."

REGLA CRÍTICA PARA AGENDAR (Tool: create_appointment):
NUNCA ejecutes la tool 'create_appointment' sin tener el NÚMERO DE TELÉFONO del cliente.
Si el cliente pide una cita y no da su teléfono, debes pedírselo amablemente.

EJEMPLOS DE CONVERSACIÓN:
User: "Quiero una cita mañana a las 10am"
Assistant: "Será un placer. Para confirmar su reserva mañana a las 10:00, ¿podría proporcionarme su nombre y número de teléfono, por favor?"
User: "Soy Juan, 555-1234"
Assistant: (Ejecuta create_appointment) "Su espacio ha sido reservado con éxito, Juan. Lo esperamos."

IMPORTANTE: Después de ejecutar una tool, responde siempre confirmando al cliente la acción realizada.
        `;
      }

      // 2. Obtener contexto de citas
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, customers(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfWeek.toISOString())
        .order('start_time', { ascending: true });

      dynamicContext = `\n\n--- CONTEXTO ACTUAL DEL NEGOCIO ---\n`;
      if (settings) {
        dynamicContext += `Horario de atención: de ${settings.opening_time} a ${settings.closing_time}.\n`;
        dynamicContext += `IMPORTANTE: No puedes agendar citas fuera de este horario. Las citas duran 1 hora.\n`;
      }
      
      if (isAdmin) {
        const todayAppointments = appointments?.filter(a => new Date(a.start_time).getDate() === now.getDate()) || [];
        dynamicContext += `\nCITAS DE LA SEMANA (${appointments?.length || 0}):\n`;
        appointments?.forEach((a: any) => {
          const time = new Date(a.start_time).toLocaleString('es-MX', {weekday: 'short', hour: '2-digit', minute:'2-digit'});
          dynamicContext += `- ID: ${a.id} | ${time} | Cliente: ${a.customers?.name || 'Anónimo'} | Estado: ${a.status}\n`;
        });
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
          temperature: 0.6,
          max_tokens: 300,
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

    // Manejo de herramientas (Tool Calling)
    if (messageObj.tool_calls) {
      const backendTools = messageObj.tool_calls.filter((tc: any) => BACKEND_TOOL_NAMES.has(tc.function.name));
      const otherTools = messageObj.tool_calls.filter((tc: any) => !BACKEND_TOOL_NAMES.has(tc.function.name));

      frontendToolCalls = otherTools.map((tc: any) => ({
        name: tc.function.name,
        arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
      }));

      // Búsqueda y Acciones en Base de Datos
      if (backendTools.length > 0 && tenantId) {
        groqMessages.push(messageObj); 
        
        for (const tc of backendTools) {
          try {
            const args = JSON.parse(tc.function.arguments);
            
            if (tc.function.name === 'search_client_info') {
              const { data: clients } = await supabase
                .from('customers')
                .select('id, name, phone, appointments(status, start_time)')
                .eq('tenant_id', tenantId)
                .ilike('name', `%${args.searchQuery}%`);
              
              groqMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.function.name,
                content: clients?.length ? JSON.stringify(clients) : "Cliente no encontrado."
              });
            }

            if (tc.function.name === 'create_appointment') {
              let customerId;
              const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('tenant_id', tenantId)
                .ilike('name', `%${args.clientName}%`)
                .maybeSingle();

              if (existingCustomer) {
                customerId = existingCustomer.id;
                if (args.phone) {
                  await supabase.from('customers').update({ phone: args.phone }).eq('id', customerId);
                }
              } else {
                const { data: newCustomer, error } = await supabase
                  .from('customers')
                  .insert({ tenant_id: tenantId, name: args.clientName, phone: args.phone || null })
                  .select()
                  .single();
                if (!error && newCustomer) customerId = newCustomer.id;
              }

              if (customerId) {
                const startDateTime = new Date(`${args.date}T${args.time}`);
                const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
                const { data: appt, error: apptError } = await supabase.from('appointments').insert({
                  tenant_id: tenantId,
                  customer_id: customerId,
                  title: `Cita con ${args.clientName}`,
                  start_time: startDateTime.toISOString(),
                  end_time: endDateTime.toISOString(),
                  status: 'scheduled',
                  notes: args.notes || ''
                }).select().single();

                if (apptError) {
                  console.error('[create_appointment] DB error:', apptError);
                  groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'create_appointment', content: `Error al agendar cita: ${apptError.message}` });
                } else {
                  groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'create_appointment', content: `Cita agendada exitosamente (ID: ${appt.id}) para ${args.clientName} el ${args.date} a las ${args.time}.` });
                }
              } else {
                groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'create_appointment', content: 'Error al crear cliente.' });
              }
            }
            
            if (tc.function.name === 'cancel_appointment') {
              // MVP de cancelación: Busca la cita de ese cliente hoy y la borra
              // En un prod real usaríamos el ID de la cita. Aquí borramos la de ese cliente.
              const { data: customer } = await supabase.from('customers').select('id').ilike('name', `%${args.clientName}%`).eq('tenant_id', tenantId).maybeSingle();
              if (customer) {
                 const { data: deleted, error: delError } = await supabase.from('appointments').delete().eq('customer_id', customer.id).eq('tenant_id', tenantId).select();
                 
                 if (delError) {
                   groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'cancel_appointment', content: `Error al cancelar: ${delError.message}` });
                 } else if (deleted && deleted.length === 0) {
                   groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'cancel_appointment', content: 'No se encontraron citas activas para ese cliente.' });
                 } else {
                   groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'cancel_appointment', content: `Cita(s) cancelada(s): ${deleted.length} registro(s) eliminado(s).` });
                 }
              } else {
                 groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'cancel_appointment', content: 'No se encontró al cliente.' });
              }
            }

            if (tc.function.name === 'set_reminder') {
              // MVP de recordatorios
              groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'set_reminder', content: 'Recordatorio guardado en memoria.' });
            }

          } catch (e) {
             groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: 'Error ejecutando herramienta' });
          }
        }
        
        data = await callGroq(groqMessages);
        messageObj = data.choices[0].message;
        reply = messageObj.content || reply;
        
        // Capturar tool_calls de la segunda iteración (ej: refresh_calendar)
        if (messageObj.tool_calls) {
          const secondFrontendTools = messageObj.tool_calls
            .filter((t: any) => t.function.name === 'refresh_calendar')
            .map((t: any) => ({
              id: t.id,
              name: t.function.name,
              arguments: JSON.parse(t.function.arguments)
            }));
          frontendToolCalls.push(...secondFrontendTools);
        }
      }
    }

    if (!reply) {
      const createdAppt = frontendToolCalls.length === 0;
      const refreshed = frontendToolCalls.some((t: any) => t.name === 'refresh_calendar');

      if (refreshed && createdAppt) {
        reply = "Listo, he procesado tu solicitud. ✨";
      } else if (refreshed) {
        reply = "¡Listo! He actualizado el calendario. ✨";
      } else {
        reply = "¡Claro! Procesando tu solicitud... ✨";
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
