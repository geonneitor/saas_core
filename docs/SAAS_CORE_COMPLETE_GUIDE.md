# 🏗️ Saas Core — Guía Completa del Sistema

> **Versión:** 0.1.0  
> **Fecha:** 14 de julio, 2026  
> **Autor:** Geo (cesargeo56@gmail.com)  
> **Dominio Producción:** `geo-dev.online`

---

## 📋 Índice

1. [Visión General](#-visión-general)
2. [Arquitectura](#-arquitectura)
3. [Requisitos del Sistema](#-requisitos-del-sistema)
4. [Variables de Entorno](#-variables-de-entorno)
5. [API Routes](#-api-routes)
6. [Autenticación (Magic Link + Whitelist)](#-autenticación-magic-link--whitelist)
7. [Lotito — Asistente IA](#-lotito--asistente-ia)
8. [Auto-Configuración desde Google Maps](#-auto-configuración-desde-google-maps)
9. [Panel Admin (/thisisn0tasecret)](#-panel-admin-thisisn0tasecret)
10. [Base de Datos](#-base-de-datos)
11. [Testing Guide](#-testing-guide)
12. [Troubleshooting](#-troubleshooting)
13. [Flujo Completo de Principio a Fin](#-flujo-completo-de-principio-a-fin)

---

## 🎯 Visión General

**Saas Core** es una plataforma multi-tenant B2B para microempresas de servicios en México (barberías, salones, clínicas, estudios de tatuajes). Permite a cada negocio tener:

- 🌐 **Landing page propia** con su marca (subdominio personalizado)
- 🤖 **Asistente IA (Lotito)** que agenda citas 24/7
- 💰 **Sistema prepago** (pago único + tokens de IA)
- 📱 **Integración WhatsApp** para recordatorios y confirmaciones
- 🗺️ **Auto-configuración** desde Google Maps

### Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| Lenguaje | TypeScript 5 |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (Magic Link) |
| IA | Google Gemini 2.0 Flash (via AI SDK v7) |
| Pagos | Stripe |
| Mapas | Google Places API |
| Estilos | Tailwind CSS 4 + CSS Variables |
| Animaciones | Framer Motion |

---

## 🏛️ Arquitectura

### Multi-tenant (Subdominios)

```
geo-dev.online              → Landing page principal
{negocio}.geo-dev.online    → Landing del negocio (tenant)
hq.geo-dev.online           → Redirige a thisisn0tasecret
thisisn0tasecret             → Panel de super-admin (ruta secreta)
```

### Proxy Multi-tenant

El archivo `src/proxy.ts` maneja el enrutamiento:

```typescript
// Ejemplos de resolución:
// "salon.geo-dev.online"        → tenant: "salon"
// "geo-dev.online"              → root (null)
// "hq.geo-dev.online"           → null (reservado)
// "localhost:3000"              → null (dev root)
```

---

## ⚙️ Requisitos del Sistema

- Node.js 20+
- npm 10+
- Cuenta de Supabase (Plan Free para empezar, Pro para custom domain)
- Cuenta de Stripe
- API Key de Google (Maps + Places)
- API Key de Google AI (Gemini)

---

## 🔐 Variables de Entorno

Crear archivo `.env.local` en la raíz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gmecnjouttietybyiyox.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google AI (Gemini para Lotito)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Google Maps (ya configurada, sirve también para Places)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCaeJAJGheYQ-ePitgNr0yuzpIl-30KRiQ

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Dominio
NEXT_PUBLIC_ROOT_DOMAIN=geo-dev.online
```

> **Nota:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ya funciona para Places API. Solo asegúrate de tener **Places API** habilitada en Google Cloud Console.

---

## 🌐 API Routes

### 🔍 Google Places

#### `POST /api/places/search`
Busca negocios en Google Maps Places API.

```bash
curl -X POST https://geo-dev.online/api/places/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Barbería Reforma CDMX"}'
```

**Response:**
```json
{
  "results": [
    {
      "placeId": "ChIJ...",
      "name": "Barbería El Campeón",
      "address": "Av. Reforma 123, CDMX",
      "rating": 4.5,
      "types": ["establishment", "hair_care"],
      "location": { "lat": 19.43, "lng": -99.13 }
    }
  ]
}
```

**Errores:**
- `400`: Query inválida (< 3 caracteres)
- `500`: API key no configurada
- `502`: Error de Google API

---

#### `POST /api/places/details`
Obtiene información detallada de un lugar.

```bash
curl -X POST https://geo-dev.online/api/places/details \
  -H "Content-Type: application/json" \
  -d '{"placeId": "ChIJ..."}'
```

**Response:**
```json
{
  "name": "Barbería El Campeón",
  "address": "Av. Reforma 123, CDMX",
  "phone": "+52 55 1234 5678",
  "website": "https://...",
  "rating": 4.5,
  "openingTime": "09:00",
  "closingTime": "18:00",
  "hoursRaw": ["Monday: 9:00 AM – 6:00 PM", ...],
  "latitude": 19.43,
  "longitude": -99.13
}
```

---

### 🤖 Asistente IA (Lotito)

#### `POST /api/assistant`
Envía un mensaje al asistente IA.

```bash
curl -X POST https://geo-dev.online/api/assistant \
  -H "Content-Type: application/json" \
  -H "Host: {tenant}.geo-dev.online" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hola, quiero agendar una cita"}
    ]
  }'
```

**Response:**
```json
{
  "reply": "¡Hola! Claro, con gusto te ayudo. ¿Cuál es tu nombre completo? 🤖✨",
  "toolCalls": []
}
```

**Rate Limiting:** 15 requests por minuto por IP

**Seguridad:** El `tenantId` se resuelve del header `Host`. Si el body envía un `tenantId` diferente al del host, se rechaza con 403.

---

### 🏪 Tenants (Admin)

#### `POST /api/tenants/rename`
Renombra un tenant. **Requiere auth de super-admin.**

```bash
curl -X POST https://geo-dev.online/api/tenants/rename \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "uuid", "name": "Nuevo Nombre"}'
```

#### `POST /api/tenants/location`
Actualiza ubicación y horarios de un tenant. **Requiere auth de super-admin.**

```bash
curl -X POST https://geo-dev.online/api/tenants/location \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "uuid",
    "lat": 19.43,
    "lng": -99.13,
    "phone": "+525512345678",
    "openingTime": "09:00",
    "closingTime": "18:00"
  }'
```

---

## 🔑 Autenticación (Magic Link + Whitelist)

### Flujo

```
1. Usuario ingresa email en /login
2. Sistema verifica whitelist (DB + fallback hardcoded)
3. Si email NO está en whitelist → redirige a /login?error=unauthorized-email
4. Si email SÍ está en whitelist → envía magic link por email
5. Usuario hace clic en magic link
6. Callback redirige a /thisisn0tasecret (super-admin) o /console (tenant owner)
```

### Whitelist de Emails

Los emails autorizados se almacenan en la tabla `whitelisted_emails`:

```sql
CREATE TABLE whitelisted_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id)
);
```

**Fallback hardcoded:** Si la tabla no existe (migración no ejecutada), el sistema usa `['cesargeo56@gmail.com']` como whitelist por defecto.

### Rate Limiting de Magic Links

Máximo **3 solicitudes de magic link por email cada 10 minutos** (in-memory, se resetea al reiniciar el servidor).

---

## 🤖 Lotito — Asistente IA

### Arquitectura

```
Usuario (Frontend) → AiAssistantChat.tsx → POST /api/assistant → Google Gemini 2.0 Flash
                        ↑                            ↓
                   toolCalls                    generateText()
                        ↑                            ↓
                   openModal()            checkAvailability()
                   router.refresh()       bookAppointment()
                   router.push()          cancelAppointment()
                                           rescheduleAppointment()
                                           getBusinessStats()
```

### Tools Disponibles

| Tool | Descripción | Disponible para |
|------|-------------|-----------------|
| `check_availability` | Revisa horarios disponibles en una fecha | Todos |
| `book_appointment` | Crea una cita (requiere nombre + fecha + hora) | Todos |
| `cancel_appointment` | Cancela una cita (requiere ID + email/teléfono) | Todos |
| `reschedule_appointment` | Reagenda una cita | Solo Admin |
| `get_business_stats` | Estadísticas del negocio | Solo Admin |
| `open_booking_modal` | Abre modal visual de agendamiento | Frontend |
| `refresh_calendar` | Refresca el calendario visual | Frontend |
| `navigate_to` | Navega a secciones del panel | Frontend |

### Modelo de IA

- **Provider:** Google AI (`@ai-sdk/google` v4)
- **Modelo:** `gemini-2.0-flash`
- **Max Steps:** 3 (encadenamiento de tools)
- **Temperatura:** Default

### Validaciones

1. **Trial:** Si el periodo de prueba expiró y no se pagó el setup fee, Lotito se niega a responder
2. **Tokens:** Si el tenant agotó sus tokens, Lotito se desconecta (mensaje de "sin saldo operativo")
3. **Rate Limit:** 15 requests/minuto por IP


### Casos de Uso

#### Cliente agendando cita
```
Usuario: "Quiero agendar una cita"
Lotito: "Claro, ¿cuál es tu nombre completo?"
Usuario: "Soy Juan Pérez"
Lotito: "Gracias Juan. ¿Para qué fecha deseas la cita?"
Usuario: "Para mañana"
Lotito: [Llama a check_availability("2026-07-15")]
        "El día de mañana tenemos disponible a las 10:00, 11:00 y 14:00. ¿Cuál prefieres?"
Usuario: "A las 10:00"
Lotito: [Llama a book_appointment("Juan Pérez", "2026-07-15", "10:00")]
        "¡Listo! Tu cita ha sido agendada para mañana a las 10:00. Te esperamos ✨"
```

#### Admin revisando estadísticas
```
Admin: "¿Cómo va el negocio hoy?"
Lotito: [Llama a get_business_stats()]
        "Hoy tenemos 5 citas agendadas y 12 clientes registrados. Todo en orden."
```

---

## 🗺️ Auto-Configuración desde Google Maps

### Flujo Completo

```
1. Admin va a /thisisn0tasecret
2. En la tabla de tenants, hace clic en "Configurar" (junto al tenant deseado)
3. Se abre modal con AutoConfigWizard
4. Paso 1: Buscar negocio en Google Maps
   - Escribe nombre del negocio
   - Sistema llama a POST /api/places/search
   - Muestra resultados clickeables
5. Paso 2: Seleccionar resultado
   - Sistema llama a POST /api/places/details
   - Se auto-llenan: nombre, dirección, teléfono, horarios
6. Paso 3: Ajustar datos manualmente
   - Editar nombre, dirección, horarios si es necesario
   - Agregar tagline personalizado
7. Paso 4: Guardar
   - Sistema guarda en business_settings (horarios, ubicación)
   - Sistema actualiza nombre del tenant si cambió
   - Sistema configura el prompt de IA con los datos del negocio
```

### Componentes

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| `AutoConfigWizard` | `src/components/tenant-ui/AutoConfigWizard.tsx` | Wizard paso a paso |
| `ConfigureTenantModal` | `src/app/thisisn0tasecret/components/ConfigureTenantModal.tsx` | Modal wrapper para admin |

### URLs de Producción

- **Auto-Configuración:** `https://geo-dev.online/thisisn0tasecret` → Botón "Configurar" en la tabla
- **Google Places Search API:** `https://geo-dev.online/api/places/search`
- **Google Places Details API:** `https://geo-dev.online/api/places/details`

---

## 🛡️ Panel Admin (/thisisn0tasecret)

### Acceso

**URL:** `https://geo-dev.online/thisisn0tasecret`  
**Auth:** Magic link + whitelist + super_admin role

### Funcionalidades

| Sección | Descripción |
|---------|-------------|
| **Dashboard** | Métricas globales (total tenants, activos, tokens usados) |
| **Tabla de Tenants** | Directorio con estado, consumo, contacto, acciones |
| **Crear Tenant** | Formulario para provisionar nuevo negocio |
| **Configurar** | AutoConfigWizard para preconfigurar negocio |
| **Tokens** | Actualizar límite de tokens por tenant |
| **Mapa** | Ver ubicación de cada negocio en Google Maps |
| **Borrar** | Suspender tenant (soft delete) |

### Sidebar

```typescript
// Navegación:
// - Tenants (Dashboard principal)
// - System Config (próximamente)
// - Sign Out (cierra sesión)
```

---

## 🗄️ Base de Datos

### Tablas Principales

```sql
tenants
├── id UUID PRIMARY KEY
├── name TEXT (nombre comercial)
├── subdomain TEXT UNIQUE
├── owner_id UUID (FK a auth.users)
├── is_active BOOLEAN
├── ai_token_limit INTEGER
├── ai_tokens_used INTEGER
├── setup_fee_paid BOOLEAN
├── trial_ends_at TIMESTAMPTZ
├── stripe_customer_id TEXT
├── stripe_subscription_id TEXT
├── referral_code TEXT
├── created_at TIMESTAMPTZ
└── updated_at TIMESTAMPTZ

business_settings
├── id UUID PRIMARY KEY
├── tenant_id UUID (FK → tenants, one-to-one)
├── business_name TEXT
├── opening_time TIME
├── closing_time TIME
├── latitude FLOAT
├── longitude FLOAT
├── whatsapp_number TEXT
├── brand_tagline TEXT
├── ai_prompt TEXT (system prompt de Lotito)
├── ai_avatar TEXT
├── ai_tone TEXT
├── ai_rules TEXT
├── hero_image TEXT
├── theme TEXT
├── font TEXT
├── trial_ends_at TIMESTAMPTZ
└── created_at TIMESTAMPTZ

whitelisted_emails
├── id UUID PRIMARY KEY
├── email TEXT UNIQUE
├── created_at TIMESTAMPTZ
└── added_by UUID (FK → auth.users)

appointments
├── id UUID PRIMARY KEY
├── tenant_id UUID (FK → tenants)
├── customer_id UUID (FK → customers)
├── title TEXT
├── start_time TIMESTAMPTZ
├── end_time TIMESTAMPTZ
├── status TEXT (scheduled | cancelled | completed)
├── notes TEXT
└── created_at TIMESTAMPTZ

customers
├── id UUID PRIMARY KEY
├── tenant_id UUID (FK → tenants)
├── name TEXT
├── email TEXT
├── phone TEXT
├── notes TEXT
└── created_at TIMESTAMPTZ
```

### Funciones RPC

```sql
increment_tokens_used(p_tenant_id UUID, p_amount INT)
handle_stripe_token_purchase(p_amount INT, p_event_id TEXT, p_event_type TEXT, p_tenant_id UUID)
is_email_whitelisted(check_email TEXT) -- Returns BOOLEAN
```

---

## 🧪 Testing Guide

### Prerrequisitos

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd saas_core
npm install

# 2. Configurar .env.local con tus keys
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 3. Iniciar dev server
npm run dev
# → http://localhost:3000
```

### Test 1: Verificar que la app responde

```bash
curl http://localhost:3000
# Debe devolver HTML de la landing page
```

### Test 2: Magic Link Auth

```bash
# Solicitar magic link (email whitelisted)
curl -X POST http://localhost:3000/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"email": "cesargeo56@gmail.com"}'

# Verificar en tu email el magic link
# Hacer clic en el enlace → debe redirigir a /thisisn0tasecret
```

### Test 3: Lotito (Asistente IA)

```bash
# Test básico (sin tenant)
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -H "Host: localhost:3000" \
  -d '{"messages":[{"role":"user","content":"Hola, quiero agendar una cita"}]}'

# Respuesta esperada: 200 con reply de Lotito
```

### Test 4: Google Places API

```bash
# Buscar negocio
curl -X POST http://localhost:3000/api/places/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Barbería Roma CDMX"}'

# Obtener detalles
curl -X POST http://localhost:3000/api/places/details \
  -H "Content-Type: application/json" \
  -d '{"placeId": "PLACE_ID_DE_RESULTADO_ANTERIOR"}'
```

### Test 5: Auto-Configuración

```bash
# Renombrar tenant (requiere cookie de sesión admin)
curl -X POST http://localhost:3000/api/tenants/rename \
  -H "Content-Type: application/json" \
  -H "Cookie: <session_cookie>" \
  -d '{"tenantId": "<tenant_uuid>", "name": "Barbería El Campeón"}'

# Actualizar ubicación (requiere cookie de sesión admin)
curl -X POST http://localhost:3000/api/tenants/location \
  -H "Content-Type: application/json" \
  -H "Cookie: <session_cookie>" \
  -d '{
    "tenantId": "<tenant_uuid>",
    "lat": 19.43,
    "lng": -99.13,
    "phone": "+525512345678",
    "openingTime": "09:00",
    "closingTime": "18:00"
  }'
```

### Test 6: Rate Limiting

```bash
# Hacer 16 requests rápidos (el límite es 15/min)
for i in $(seq 1 16); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/assistant \
    -H "Content-Type: application/json" \
    -H "Host: localhost:3000" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done

# El request #16 debe devolver 429 (Too Many Requests)
```

---

## 🔧 Troubleshooting

### "Another next build process is already running"

```bash
# En Windows:
taskkill /F /IM node.exe /T

# En Mac/Linux:
killall node

# Luego limpiar caché:
rm -rf .next
```

### "models/gemini-1.5-flash is not found for API version v1beta"

**Causa:** El modelo `gemini-1.5-flash` no está disponible en la región/configuración actual.

**Solución:** El código ya usa `gemini-2.0-flash` (más reciente). Si el error persiste:
1. Verificar que `GOOGLE_GENERATIVE_AI_API_KEY` esté configurada en `.env.local`
2. Verificar que la API key tenga acceso a Gemini API en [Google AI Studio](https://aistudio.google.com/)

### Google Places API no devuelve resultados

**Causa:** Places API no está habilitada para la API key.

**Solución:**
1. Ve a [Google Cloud Console → APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click en **"+ Enable APIs and Services"**
3. Busca **"Places API"**
4. Habilítala

### Turbopack crash en Windows ("nul" device file bug)

**Causa:** En algunas versiones de Windows, Turbopack (el bundler por defecto de Next.js 16) falla al intentar escribir en el archivo `nul`, causando un error "An unexpected Turbopack error occurred".

**Solución:**
1. Limpia el caché: `rm -rf .next`
2. Mata procesos colgados: `taskkill /F /IM node.exe /T`
3. Vuelve a iniciar: `npm run dev`
4. Si el error persiste, usa Webpack en lugar de Turbopack:
   ```bash
   # Opción 1: Usar set (nativo de Windows)
   set NEXT_TURBOPACK=0 && next dev
   
   # Opción 2: Instalar cross-env y usarlo
   npm install -D cross-env
   npx cross-env NEXT_TURBOPACK=0 next dev
   ```

### Host header required for Lotito API

**Error:** `403 tenantId does not match the request origin`

**Causa:** El API `/api/assistant` resuelve el tenant desde el header `Host`. Si haces un curl sin especificar `Host`, el servidor no sabe a qué negocio pertenece el request.

**Solución:** Siempre incluye el header `Host` en tus requests:
```bash
curl -X POST http://localhost:3000/api/assistant \
  -H "Host: localhost:3000" \
  -d '{"messages": [...]}'
```

Desde el frontend (navegador), el header se envía automáticamente.

### Magic Link no llega al email

**Causa:** Supabase no tiene configurado un servicio de emails (SMTP).

**Solución:**
1. Ve a Supabase Dashboard → Authentication → Settings
2. Configura SMTP (SendGrid, Resend, etc.)
3. O verifica que el email esté en la whitelist

### "Acceso denegado" en /thisisn0tasecret

**Causa:** El usuario autenticado no tiene rol `super_admin`.

**Solución:**
1. Conecta a la base de datos de Supabase
2. Ejecuta: `UPDATE profiles SET role = 'super_admin' WHERE id = '<user_id>';`

---

## 🔄 Flujo Completo de Principio a Fin

### Para el Vendedor/Admin

```
1. Crear Tenant
   └→ /thisisn0tasecret → Llenar formulario "Desplegar Inquilino"
   └→ Se crea tenant con 1000 tokens iniciales + business_settings default

2. Configurar Negocio
   └→ Click "Configurar" en la tabla de tenants
   └→ AutoConfigWizard modal se abre
   └→ Buscar negocio en Google Maps
   └→ Seleccionar resultado → se auto-llenan datos
   └→ Ajustar detalles → Guardar
   └→ Datos guardados: nombre, horarios, ubicación, tagline, prompt IA

3. El Tenant está listo
   └→ El dueño puede ver su landing page en {subdomain}.geo-dev.online
   └→ Lotito ya conoce los datos del negocio (horarios, dirección, servicios)
   └→ Clientes pueden agendar citas por chat
```

### Para el Dueño del Negocio

```
1. Recibe enlace de su landing page
   └→ https://subdomain.geo-dev.online

2. Personaliza (opcional)
   └→ https://subdomain.geo-dev.online/console
   └→ Tema, colores, avatar IA, prompt
   └→ Servicios, horarios, reglas de negocio

3. Comparte con clientes
   └→ Los clientes llegan a la landing page
   └→ Click en Lotito → chat para agendar
   └→ Lotito guía paso a paso: fecha → hora → confirmación
```

### Para el Cliente Final

```
1. Llega a la landing page del negocio
   └→ Ve horarios, servicios, fotos
   └→ Click en el botón de chat (esquina inferior derecha)

2. Habla con Lotito (el asistente IA)
   └→ "Quiero agendar una cita"
   └→ Lotito pregunta nombre, fecha, hora
   └→ Verifica disponibilidad en tiempo real
   └→ Confirma la cita

3. Recibe confirmación
   └→ En el chat: "Tu cita ha sido agendada ✨"
   └→ (Próximamente) Recordatorio por WhatsApp 24h antes
```

---

## 📦 Commit y Push

```bash
# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat(sprint-5.3): complete production documentation and testing guide

- Add comprehensive SAAS_CORE_COMPLETE_GUIDE.md
- Document all API routes with examples
- Document Lotito AI assistant flow and tools
- Document Auto-ConfigWizard integration
- Add testing guide with curl commands
- Add troubleshooting section
- Add end-to-end flow documentation"

# Push a GitHub
git push origin main
```

---

> **Documentación generada el 14 de julio, 2026**  
> *Para preguntas o soporte: cesargeo56@gmail.com*
