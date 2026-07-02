import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

export async function POST(req: Request) {
  try {
    const { messages, tenantId } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'La API Key de Groq no está configurada.' }, { status: 500 });
    }

    const supabase = await createClient();
    let dynamicContext = "";
    let basePrompt = "Eres un asistente IA altamente capacitado.";

    if (tenantId) {
      // 1. Obtener settings del negocio (incluye el AI Prompt personalizado)
      const { data: settings } = await supabase.from('business_settings').select('*').eq('tenant_id', tenantId).single();
      if (settings?.ai_prompt) {
        basePrompt = settings.ai_prompt;
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
        dynamicContext += `Horario de apertura: ${settings.opening_time}\n`;
        dynamicContext += `Horario de cierre: ${settings.closing_time}\n`;
      }
      
      const todayAppointments = appointments?.filter(a => new Date(a.start_time).getDate() === now.getDate()) || [];
      dynamicContext += `\nCITAS DE LA SEMANA (${appointments?.length || 0}):\n`;
      appointments?.forEach((a: any) => {
        const time = new Date(a.start_time).toLocaleString('es-MX', {weekday: 'short', hour: '2-digit', minute:'2-digit'});
        dynamicContext += `- ID: ${a.id} | ${time} | Cliente: ${a.customers?.name || 'Anónimo'} | Estado: ${a.status}\n`;
      });
      
      dynamicContext += `\nDIRECTRICES: Si te piden agendar, usa 'open_booking_modal'. Si te piden cancelar, usa 'cancel_appointment'. Nunca digas que tú no puedes hacerlo.`;
    }

    let groqMessages = [
      { role: 'system', content: basePrompt + dynamicContext },
      ...messages.map((m: any) => ({
        role: m.sender === 'lotito' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text || m.content,
      })),
    ];

    async function callGroq(msgs: any[]) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY!.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: msgs,
          temperature: 0.6,
          max_tokens: 300,
          tools: TOOLS,
          tool_choice: "auto"
        }),
      });
      if (!response.ok) throw new Error('Error de Groq');
      return response.json();
    }

    let data = await callGroq(groqMessages);
    let messageObj = data.choices[0].message;
    let reply = messageObj.content || '';
    let frontendToolCalls: any[] = [];

    // Manejo de herramientas (Tool Calling)
    if (messageObj.tool_calls) {
      const backendTools = messageObj.tool_calls.filter((tc: any) => ['search_client_info', 'cancel_appointment', 'set_reminder'].includes(tc.function.name));
      const otherTools = messageObj.tool_calls.filter((tc: any) => !['search_client_info', 'cancel_appointment', 'set_reminder'].includes(tc.function.name));

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
                name: 'search_client_info',
                content: JSON.stringify(clients || { error: 'No se encontraron clientes' })
              });
            }
            
            if (tc.function.name === 'cancel_appointment') {
              // MVP de cancelación: Busca la cita de ese cliente hoy y la borra
              // En un prod real usaríamos el ID de la cita. Aquí borramos la de ese cliente.
              const { data: customer } = await supabase.from('customers').select('id').ilike('name', `%${args.clientName}%`).eq('tenant_id', tenantId).maybeSingle();
              if (customer) {
                 await supabase.from('appointments').delete().eq('customer_id', customer.id).eq('tenant_id', tenantId);
                 groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'cancel_appointment', content: 'Cita cancelada correctamente.' });
              } else {
                 groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'cancel_appointment', content: 'No se encontró la cita para ese cliente.' });
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
      }
    }

    if (!reply && frontendToolCalls.length > 0) {
      reply = "¡Claro! Procesando tu solicitud... ✨";
    }

    return NextResponse.json({ reply, toolCalls: frontendToolCalls });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
