# 🏭 PRODUCTION HARDENING SPEC — saas_core

**Fecha:** 15 de julio, 2026  
**Autor:** Geo (cesargeo56@gmail.com)  
**Dominio:** `geo-dev.online`  
**Estado:** ESPECIFICACIÓN V1 — Pre-implementación  
**Objetivo:** Convertir saas_core de prototipo funcional a producto vendible, blindado y escalable para 200+ clientes.

---

## 📋 Índice

1. [Modelo de Negocio](#1-modelo-de-negocio)
2. [Landing Page (Público)](#2-landing-page-público)
3. [Flujo de Venta y Onboarding](#3-flujo-de-venta-y-onboarding)
4. [Landing del Tenant (Cliente Final)](#4-landing-del-tenant-cliente-final)
5. [Console del Dueño](#5-console-del-dueño)
6. [PseudoIA — Guía de Agendamiento](#6-pseudoia--guía-de-agendamiento)
7. [Flujo de Depósito y Confirmación](#7-flujo-de-depósito-y-confirmación)
8. [Pagos y Billetera](#8-pagos-y-billetera)
9. [WhatsApp Integration](#9-whatsapp-integration)
10. [Módulos y Pricing](#10-módulos-y-pricing)
11. [Super Admin HQ](#11-super-admin-hq)
12. [Escalabilidad a 200+ Clientes](#12-escalabilidad-a-200-clientes)
13. [Seguridad y Blindaje](#13-seguridad-y-blindaje)
14. [Plan de Implementación por Fases](#14-plan-de-implementación-por-fases)

---

## 1. Modelo de Negocio

### 1.1 Cliente Objetivo
- **Comprador:** Geo (vendedor) va directamente a negocios locales (barberías, salones, clínicas, estudios de tatuaje, spas) a ofrecer el sistema.
- **Usuario final:** El dueño del negocio recibe un sistema **preconfigurado** que ya tiene su nombre, dirección, imagen de ejemplo y un calendario funcional para que sus clientes agenden citas.
- **Cliente del dueño:** Persona final que agenda una cita. No necesita registrarse, solo da nombre + apellido + WhatsApp + anticipo.

### 1.2 Flujo de Venta (Híbrido)
```
Fase 1 (Offline - Geo vende):
  Geo → contacto con dueño → demo → acuerdo → Geo preconfigura → entrega

Fase 2 (Autoservicio - futuro):
  Dueño → landing → selecciona plan → paga → sistema se auto-configura
```

### 1.3 Pricing (TODO en MXN)
| Ítem | Precio | Notas |
|------|--------|-------|
| Setup Fee (completo) | $1,999 MXN | Pago único, dueño absoluto |
| Adelanto (30%) | $600 MXN | Asegura la promo durante prueba |
| Saldo restante | $1,399 MXN | Liquida después del adelanto |
| Tokens 5,000 | $150 MXN | Recarga de IA |
| Tokens 15,000 | $350 MXN | Más popular |
| Tokens 35,000 | $750 MXN | Enterprise |
| WhatsApp Autopilot | $149 USD | Módulo premium (pago único) |
| Terminal POS | $99 USD | Módulo premium (pago único) |
| Analytics Avanzado | $49 USD | Módulo premium (pago único) |

**Importante:** Los tokens packs en WalletDashboard (`price_tokens_150`, etc.) deben corresponder con los que procesa el webhook. Actualmente hay mismatch.

---

## 2. Landing Page (Público)

### 2.1 Propósito
La landing `geo-dev.online` tiene **dos caras**:
1. **Cara técnica** (para developers/curiosos): Muestra la arquitectura, seguridad, zero trust.
2. **Cara comercial** (para dueños de negocio): Muestra los beneficios, casos de uso, testimoniales.

### 2.2 Estado Actual vs Deseado

| Elemento | Hoy | Debería ser |
|----------|-----|-------------|
| Hero | "Ingeniería Web de Alto Calibre" | **Dual:** Título técnico + subtítulo comercial tipo "Tu negocio con IA 24/7" |
| Navbar | Links a secciones técnicas | + Link "Para tu negocio" que baja a sección comercial |
| Features Grid | 0.4s SSR, Zero Trust, Multi-Tenant | + Sección "Beneficios para tu negocio" con casos de uso reales |
| Contact Form | Lead capture genérico | Captura leads con industria + teléfono. Redirige a calendario de Geo |
| Link Sign In | Está en Hero | **MOVER** a navbar discreto o quitarlo. No es acción principal |
| CTA principal | "Iniciar Secuencia de IA" (demo técnica) | + "Quiero esto para mi negocio" que lleva a form de contacto o demo |

### 2.3 Acciones Concretas
1. **No eliminar** el Acid Brutalist actual (es la identidad técnica)
2. **Agregar** sección comercial después del hero: "¿Eres dueño de un negocio?" con:
   - Mockup de cómo se ve la landing del tenant
   - Video/gif de la pseudoIA guiando una cita
   - Testimonios (placeholder por ahora)
   - Botón "Quiero una demo" → redirige a agenda de Geo (Calendly/cal.com)
3. **Modificar** ContactForm para que incluya campo "Industria" (barbería, salón, clínica, etc.)
4. **Deshabilitar** el link de "Sign in" del Hero, moverlo al footer como "Acceso de partners"

---

## 3. Flujo de Venta y Onboarding

### 3.1 Proceso de Venta (Geo)

```
1. Geo contacta al dueño
2. Geo muestra demo (landing pública genérica + pseudoIA)
3. Acuerdo verbal
4. Geo va al HQ → crea tenant con nombre del negocio
5. Geo abre AutoConfigWizard → busca negocio en Google Maps
   → Se auto-llenan: nombre, dirección, teléfono, horarios, coordenadas
6. Geo ajusta y guarda
7. Geo notifica al dueño: "Tu sistema está listo en {sub}.geo-dev.online"
8. Dueño entra a su landing → ve su negocio con datos reales
9. Dueño hace clic en "Ir a Consola" (solo visible para él)
10. Dueño configura: servicios, precios, avatar, prompt IA, reglas
11. Dueño comparte su link con clientes
12. Clientes llegan → pseudoIA los guía → agendan citas
```

### 3.2 Mínimo Entregable (antes de avisar al dueño)

Checklist que Geo debe completar antes de entregar:
- [x] Nombre del negocio
- [x] Dirección
- [x] Teléfono / WhatsApp
- [x] Horarios (apertura/cierre)
- [x] Tagline / mensaje de bienvenida
- [x] Prompt IA básico (se genera automático con los datos)
- [x] Imagen de fondo (default o de Unsplash por industria)

**Opcional (el dueño lo configura después):**
- Servicios con precios
- Avatar IA
- Colores y fuente
- Reglas de negocio
- Foto personalizada

---

## 4. Landing del Tenant (Cliente Final)

### 4.1 URL
`https://{subdominio}.geo-dev.online`

### 4.2 Componentes

| Componente | Estado | Acción requerida |
|------------|--------|------------------|
| Navbar minimalista | ✅ Funcional | Agregar: nombre del negocio + logo |
| PremiumHero | ✅ Funcional | Agregar: botón "Agendar ahora" más prominente |
| DynamicManifesto | ✅ Funcional | Texto genérico. **Hacerlo configurable** desde Console |
| Features Grid | ✅ Funcional | 3 features genéricos. **Hacerlos dinámicos** desde services_json |
| WhatsApp Button | ✅ Funcional | Link directo al wa.me del negocio |
| PseudoIA Chat | ⚠️ Existe | **Requiere rediseño completo** (ver sección 6) |
| Footer | ✅ Funcional | Links correctos |
| LiveTrialWizard | ⚠️ Solo admin | ✅ OK así |

### 4.3 Cambios Requeridos
1. **Footer link "Powered by AI"**: Hoy apunta a `app.{domain}`. Cambiar a `/login` o quitarlo.
2. **Agregar** sección de "Servicios y Precios" dinámica (desde `services_json`).
3. **Agregar** galería de fotos del negocio (desde `hero_image` array).
4. **PseudoIA**: Debe aparecer automáticamente para clientes nuevos (no solo con clic).

---

## 5. Console del Dueño

### 5.1 Ruta
`/{subdomain}/console`

### 5.2 Estado por Pestaña

| Pestaña | Estado | Problema | Acción |
|---------|--------|----------|--------|
| **Dashboard** | ⚠️ Placeholder | Citas: 0, +0% semanal hardcodeado | Reemplazar con métricas reales (últimas 24h: citas agendadas, clientes nuevos, tokens restantes, citas pendientes de pago) |
| **AI Control Center** | ✅ Funcional | ToneSelector, ServicesManager, BusinessRulesManager OK | Mejorar feedback de guardado. Agregar campo "mensaje de bienvenida de la IA" |
| **Calendario** | ⚠️ Lista plana | No hay calendario visual. Solo lista de citas | Implementar vista calendario (semana/mes). Marcar citas pendientes de pago vs confirmadas |
| **Clientes** | ⚠️ Search roto | Input de búsqueda sin handler | Implementar búsqueda/filtro. Agregar historial de citas por cliente |
| **Facturación** | ✅ Funcional | WalletDashboard, Stripe buttons OK | ⚠️ **CRITICAL:** Arreglar priceIds mismatch |
| **Configuración** | ✅ Funcional | AiSettingsForm OK. Kill-switch decorativo | Hacer funcional el Kill-switch (pausar IA realmente) |
| **Store** | ✅ Funcional | Marketplace, módulos, tokens packs OK | ⚠️ **CRITICAL:** Arreglar priceIds con webhook |

### 5.3 Dashboard Real (Nuevo Diseño)

```
┌──────────────────────────────────────────┐
│  Bienvenido, {Nombre del Negocio}.       │
│  Tu asistente IA está listo.            │
│                                          │
│  [✅ Configurar IA]  [📢 Compartir Link] │
│                                          │
│  ┌──────────┬──────────┬──────────┐      │
│  │ Citas Hoy │ Clientes  │ Citas    │     │
│  │    3      │   45      │ Pend. 2  │     │
│  │ +1 vs ayer│ +12 nuevo │ ⏳ Pago  │     │
│  └──────────┴──────────┴──────────┘      │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  📋 CITAS PENDIENTES DE PAGO     │    │
│  │  Juan Pérez - Hoy 16:00 - $150   │    │
│  │  [✅ Confirmar] [❌ Rechazar]    │    │
│  │  María López - Mañana 10:00 - $200│   │
│  │  [✅ Confirmar] [❌ Rechazar]    │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### 5.4 Calendario
- **Requerido:** Vista mes/semana interactiva (similar a Google Calendar)
- Las citas confirmadas se ven en verde
- Las citas pendientes de pago se ven en amarillo
- Clic en cita → muestra datos del cliente, estado del pago
- El dueño puede cancelar/reagendar desde la vista de calendario

---

## 6. PseudoIA — Guía de Agendamiento

### 6.1 Concepto
No es un chatbot autónomo que agenda sin supervisión. Es un **guía interactivo paso a paso** que:
1. Saluda y explica el proceso
2. Pregunta los datos del cliente (nombre completo + WhatsApp)
3. Muestra los servicios disponibles (desde `services_json`)
4. Pregunta fecha y hora deseada
5. Sugiere add-ons (servicios adicionales)
6. Calcula el total + anticipo requerido
7. Pide al cliente que realice el pago (transferencia/efectivo/tarjeta)
8. Da las instrucciones para enviar el comprobante (subir foto aquí o enviar por WhatsApp)
9. Bloquea el horario temporalmente (30 min)
10. Notifica al dueño que hay una cita pendiente de aprobación

### 6.2 Flujo Detallado

```
Paso 1: SALUDO
  PseudoIA: "¡Hola! Soy el asistente virtual de {Nombre Negocio}. 
  Puedo ayudarte a agendar una cita en segundos. ¿Cómo te llamas?"

Paso 2: DATOS DEL CLIENTE
  Cliente: "Soy Juan Pérez"
  PseudoIA: "Gracias Juan. ¿Cuál es tu número de WhatsApp para confirmar?"
  Cliente: "5512345678"
  PseudoIA: "[Guarda en DB como customer con status 'pending']"

Paso 3: SERVICIOS
  PseudoIA: "Estos son nuestros servicios:"
  - Corte de Cabello ...... $200 (30 min)
  - Corte + Barba ......... $350 (45 min)
  - Corte VIP ............. $500 (60 min)
  "¿Cuál te gustaría?"
  Cliente: "Corte + Barba"

Paso 4: FECHA Y HORA
  PseudoIA: [Llama a check_availability()]
  "Tenemos disponible:
  - Hoy 16:00
  - Hoy 17:00
  - Mañana 10:00
  ¿Cuándo te queda mejor?"
  Cliente: "Hoy 16:00"

Paso 5: ADD-ONS (opcional)
  PseudoIA: "¿Te gustaría agregar alguno de estos extras?
  - Cera para cabello .... $50
  - Shampoo premium ....... $80
  - Cejas ................ $60"
  Cliente: "No, gracias"

Paso 6: CONFIRMACIÓN Y ANTICIPO
  PseudoIA: "Perfecto Juan. Tu cita:
  - Servicio: Corte + Barba ($350)
  - Fecha: Hoy 16:00
  - Duración: 45 min
  
  Para confirmar, necesitamos un anticipo de $100 (configurable por dueño).
  
  Puedes pagar por:
  🏦 Transferencia: 1234-5678-90 (BBVA)
  💵 Efectivo: Pasando al negocio
  💳 Tarjeta: [Link de pago Stripe]
  
  Después de pagar, sube tu comprobante aquí o envíalo por WhatsApp al {número}.
  ¿Te parece bien?"

Paso 7: CLIENTE PAGA
  Cliente sube foto del comprobante o paga por Stripe

Paso 8: NOTIFICACIÓN AL DUEÑO
  PseudoIA: "¡Gracias Juan! He notificado al dueño. 
  Te confirmaremos tu cita en breve.
  Mientras tanto, tu horario está reservado por 30 minutos ⏳"
  
  → Sistema bloquea el horario (30 min)
  → Aparece en "Citas Pendientes de Pago" en el Dashboard del dueño
  → (Opcional) Se envía mensaje por WhatsApp al dueño

Paso 9: DUEÑO CONFIRMA
  Dueño ve en Console → Citas Pendientes → [✅ Confirmar] [❌ Rechazar]
  → Si confirma: status → 'scheduled', cliente recibe confirmación
  → Si rechaza o expira: status → 'cancelled', horario se libera
```

### 6.3 Reglas de la PseudoIA

| Regla | Comportamiento |
|-------|---------------|
| **Sin anticipo configurado** | Salta pasos 6-8, agenda directo |
| **Cliente no paga en 30 min** | Horario se libera automáticamente. Cliente recibe mensaje "El horario ya no está disponible" |
| **Dueño rechaza cita** | Cliente recibe mensaje de disculpa + link de WhatsApp para contactar directo |
| **Sin servicios configurados** | PseudoIA no muestra catálogo. Solo pregunta fecha/hora |
| **Tokens agotados** | PseudoIA se "duerme": "Lo siento, estoy muy cansado por ahora" pero muestra WhatsApp link |
| **Ventana fuera de horario** | PseudoIA no permite agendar. Muestra horario laboral |
| **Navegador no soporta** | Fallback a formulario simple + WhatsApp |

### 6.4 Tutorial/Scratching
La PseudoIA debe funcionar como **tutorial interactivo**: las primeras veces que un cliente usa el sistema, la IA explica CADA paso con más detalle. Después de 2-3 interacciones, acelera el proceso.

---

## 7. Flujo de Depósito y Confirmación

### 7.1 Métodos de Pago (configurable por dueño)
| Método | Cómo funciona |
|--------|---------------|
| Transferencia | Cliente sube foto del comprobante desde el chat o WhatsApp |
| Efectivo | Cliente paga en el local y menciona el nombre al llegar |
| Stripe Link | Sistema genera link de pago, cliente paga con tarjeta, confirmación automática |

### 7.2 Temporizador de 30 Minutos
- Cuando el cliente confirma la cita pero NO ha pagado, el horario se bloquea por 30 min
- UI en la landing: "Este horario está reservado para ti por 30 minutos ⏳"
- Si expira: el horario se libera y el cliente recibe "El horario ha sido liberado. Puedes elegir otro horario si lo deseas."
- El cliente puede solicitar extender el lock si está en proceso de pago

### 7.3 Cola de Aprobación (Dashboard del Dueño)
```
┌──────────────────────────────────────────────┐
│  CITAS PENDIENTES DE APROBACIÓN (2)          │
├──────────────────────────────────────────────┤
│  Juan Pérez - Hoy 16:00                      │
│  Corte + Barba ($350) - Anticipo: $100       │
│  WhatsApp: 5512345678                        │
│  [📷 Ver comprobante] [✅ Confirmar] [❌ Denegar]│
│  ⏳ Faltan 18 min para liberar horario       │
├──────────────────────────────────────────────┤
│  María López - Mañana 10:00                  │
│  Corte VIP ($500) - Anticipo: $200           │
│  WhatsApp: 5587654321                        │
│  Pagó con Stripe ✅ - Confirmación automática│
└──────────────────────────────────────────────┘
```

### 7.4 Integración WhatsApp
- **Fase 1 (ahora):** Link wa.me con texto pre-escrito que incluye datos de la cita + monto.
- **Fase 2 (módulo pago):** WhatsApp Business API con chatbot que recibe comprobantes, responde automáticamente, y notifica al dueño.

---

## 8. Pagos y Billetera

### 8.1 Estado Actual y Fixes Requeridos

#### 🔴 CRITICAL: Mismatch de Price IDs

**Problema:** WalletDashboard usa priceIds como `'price_tokens_150'`, `'price_tokens_350'`, `'price_tokens_750'` pero el webhook y el checkout esperan `moduleId` como `'tokens_10k'`, `'tokens_50k'`, `'tokens_200k'`.

**Solución:**

```typescript
// Catálogo unificado (server-side, evita inyección de precios)
const TOKEN_PACKS = {
  'tokens_5k':  { price: 150, tokens: 5000,  name: 'Pack Inicial' },
  'tokens_15k': { price: 350, tokens: 15000, name: 'Pack Crecimiento' },
  'tokens_35k': { price: 750, tokens: 35000, name: 'Pack Enterprise' },
};

const MODULE_PRICES = {
  'whatsapp': 149,
  'pos':       99,
  'analytics': 49,
};
```

**WalletDashboard debe enviar el moduleId correcto al checkout**, no un priceId inventado.

### 8.2 Flujo de Compra
```
1. Dueño elige pack en WalletDashboard
2. Frontend → POST /api/stripe/checkout con { moduleId: 'tokens_15k', tenantId }
3. Backend calcula price desde catálogo (server-side)
4. Stripe crea session
5. Webhook recibe evento → handle_stripe_token_purchase()
6. Se incrementa ai_token_limit (no ai_tokens_used)
7. Dueño ve tokens actualizados en Dashboard
```

### 8.3 Setup Fee (Pago Único)
- **Adelanto (30%):** $600 MXN — asegura la promo durante prueba de 7 días
- **Liquidación restante:** $1,399 MXN — completa el pago
- **Pago de contado:** $1,999 MXN — dueño absoluto de inmediato
- Estado se guarda en `tenants.setup_fee_paid` y `tenants.setup_advance_paid`

---

## 9. WhatsApp Integration

### 9.1 Fase 1 — Link Directo (Core, incluido)
- Botón flotante en landing del tenant
- Link `wa.me/{número}` con mensaje predefinido
- La pseudoIA puede redirigir al cliente a WhatsApp para enviar comprobante
- El dueño recibe el comprobante y confirma manualmente desde su panel

### 9.2 Fase 2 — WhatsApp Business API (Módulo Pago: $149 USD)
- Chatbot que recibe imágenes y responde automáticamente
- Confirmación automática de pagos
- Recordatorios automáticos 24h antes
- Notificaciones al dueño de nuevas citas pendientes
- Flujo completo de agendamiento desde WhatsApp sin tocar la web

---

## 10. Módulos y Pricing

### 10.1 Core (Incluido en Setup Fee)
- Landing page del negocio (subdominio personalizado)
- Calendario de citas (vista lista + visual en roadmap)
- Directorio de clientes
- PseudoIA guía de agendamiento
- WhatsApp link directo
- Dashboard con métricas básicas
- AI Control Center (configuración de servicios, tono, reglas)
- Billetera prepago de tokens

### 10.2 Módulos Premium (Pago Único)

| Módulo | Precio USD | Funcionalidades |
|--------|-----------|-----------------|
| **WhatsApp Autopilot** | $149 | Bot WhatsApp, recordatorios auto, confirmación automática, agendamiento por chat |
| **Terminal POS** | $99 | Cobro con tarjeta, tickets, control de efectivo, corte de caja |
| **Analytics Avanzado** | $49 | Predicciones de ventas IA, exportación Excel, reportes contables |

### 10.3 Tokens de IA (Recargables)
| Pack | Tokens | Precio MXN | Precio USD (aprox) |
|------|--------|-----------|-------------------|
| Pack Inicial | 5,000 | $150 | ~$8 |
| Pack Crecimiento | 15,000 | $350 | ~$18 |
| Pack Enterprise | 35,000 | $750 | ~$39 |

### 10.4 Dominio Personalizado (Upsell)
- Feature premium: el dueño puede usar su propio dominio
- No incluido en core
- Precio: por definir (posible $5-10 USD/mes)

---

## 11. Super Admin HQ

### 11.1 Estado Actual
El HQ (`/thisisn0tasecret`) está **casi completo** con Acid Brutalist UI, métricas, tabla de tenants, CRUD, AutoConfigWizard.

### 11.2 Mejoras Requeridas
1. **'System Config' sidebar**: Remover o implementar. Hoy apunta a `#config` sin contenido.
2. **'Salud del Sistema: 100%'**: Reemplazar con métrica real (uptime de API, últimos errores, etc.)
3. **Gestión de whitelist**: Interfaz para agregar/quitar emails whitelisted directamente desde HQ.
4. **Historial de acciones**: Tabla de audit_log visible en HQ.
5. **Notificaciones de tenants sin tokens**: Lista de tenants que están por agotar tokens.
6. **Webhook logs**: Visibilidad de eventos de Stripe recibidos.
7. **Exportar datos de tenant**: Botón para descargar respaldo de un tenant.

---

## 12. Escalabilidad a 200+ Clientes

### 12.1 Cuellos de Botella Actuales

| Componente | Problema | Solución |
|-----------|----------|----------|
| Rate Limiting (in-memory) | Se resetea al reiniciar server | Migrar a Upstash Redis o tabla en DB |
| Whitelist fallback | Hardcodeado `cesargeo56@gmail.com` | Ejecutar migración SQL para que whitelist sea 100% DB-backed |
| Cookie domain | Hardcodeado `.geo-dev.online` y `localhost` | Helper `getAppUrl()` desde `NEXT_PUBLIC_ROOT_DOMAIN` |
| proxy.ts sin allowlist | Cualquier subdominio se reescribe como tenant | Regex allowlist: `^(?:[a-z0-9-]+\.)?(localhost|geo-dev\.online|vercel\.app)$` |
| `app.tu-dominio.com` hardcodeado | 6 lugares | Helper `getAppUrl()` centralizado |
| `console.log` en producción | 17+ ocurrencias | Envolver en `if (NODE_ENV !== 'production')` |
| `any` / `@ts-ignore` | ~30+ ocurrencias | Sprint 3.3: Tipos estrictos |

### 12.2 Arquitectura para 200 Tenants

```
Capa CDN (Vercel Edge):
  - 200 tenants × 10 landing pages/día = 2,000 req/día (mínimo)
  - Rate limiting: 15 req/min por IP para API → 200 tenants × ~100 clientes = 20,000 req/día
  
Base de Datos (Supabase Free → Pro):
  - Free: 2GB, 500 rows → OK para 50 tenants
  - Pro ($25/mes): 8GB, escalable → NECESARIO para 200 tenants

Stripe:
  - 200 tenants × 1 setup fee = 200 transacciones (una vez)
  - Tokens: ~1-2 recargas/mes por tenant = 200-400 transacciones/mes

Almacenamiento de imágenes:
  - Supabase Storage o Cloudinary para fotos de tenants
```

### 12.3 Estrategia de Caché

| Dato | Estrategia | TTL |
|------|-----------|-----|
| Datos del tenant (landing) | `unstable_cache` con tag `'tenants'` | 60s |
| Business settings | `unstable_cache` | 60s |
| Precios de servicios | Server component cache | 60s |
| Sesión del usuario | Cookie HTTP-only (Supabase) | N/A |
| Rate limit state | Por migrar a Upstash Redis | 60s |

---

## 13. Seguridad y Blindaje

### 13.1 Principios (ya implementados)
- ✅ Nunca usar service_role en cliente
- ✅ Validar owner_id en Server Actions
- ✅ No aceptar `price`, `isAdmin`, `tenantId` del body sin validar
- ✅ Catálogo de precios server-side (evita inyección en Stripe)
- ✅ Idempotencia en webhooks (tabla `stripe_events`)
- ✅ Whitelist de emails (DB + fallback)
- ✅ Rate limiting en rutas críticas

### 13.2 Lo que Falta Reforzar

| Riesgo | Mitigación |
|--------|-----------|
| **proxy.ts sin allowlist** | Agregar regex que valide hostname antes de reescribir como tenant |
| **CSRF en magic link** | Validar origin del request en sendMagicLinkAction (hoy solo usa email) |
| **Inyección en services_json** | Validar schema con Zod antes de guardar y al leer |
| **XSS en tenant landing** | Los datos del tenant vienen de DB → sanitizar al renderizar (hoy se renderizan directo) |
| **Ataque de fuerza bruta** | Rate limiting + bloqueo temporal de IP después de X intentos fallidos |
| **Exposición de API keys** | Verificar que ninguna key se filtra al cliente |
| **Token spoofing** | Validar que `increment_tokens_used` no pueda ser llamado con valores negativos |

---

## 14. Plan de Implementación por Fases

### 🔴 Fase 1 — Correcciones Críticas (Semana 1)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 1 | Unificar priceIds WalletDashboard ↔ webhook | `WalletDashboard.tsx`, `checkout/route.ts`, `webhook/route.ts` | Bajo |
| 2 | Remover link "Sign in" del Hero público | `PublicHero.tsx` | Bajo |
| 3 | Hacer funcional el search de clientes | `customers/page.tsx` | Bajo |
| 4 | Fix: `photoRef: null` en Places Details (mostrar placeholder) | `details/route.ts`, `AutoConfigWizard.tsx` | Bajo |
| 5 | Remover/implementar "System Config" en sidebar HQ | `layout.tsx` (/thisisn0tasecret) | Bajo |

### 🟠 Fase 2 — PseudoIA y Flujo de Depósito (Semana 2-3)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 6 | Rediseñar mensaje de bienvenida de la IA como guía paso a paso | `AiAssistantChat.tsx` | Medio |
| 7 | Implementar flujo de captura de datos del cliente (nombre + WhatsApp) | `AiAssistantChat.tsx`, `tools.ts` | Medio |
| 8 | Implementar sistema de "cita pendiente de pago" con temporizador 30 min | `tools.ts`, `route.ts` (assistant) | Alto |
| 9 | Crear cola de aprobación en Dashboard del dueño | `console/page.tsx` | Alto |
| 10 | Integrar subida de comprobante (foto) en el chat | `AiAssistantChat.tsx` | Medio |
| 11 | Implementar link wa.me con pre-escrito del comprobante | `AiAssistantChat.tsx` | Bajo |

### 🟡 Fase 3 — Console y Dashboard Real (Semana 3-4)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 12 | Reemplazar placeholders del Dashboard con métricas reales | `console/page.tsx` | Medio |
| 13 | Implementar vista calendario (mes/semana) con colores por estado | `calendar/page.tsx` | Alto |
| 14 | Agregar historial de citas por cliente en Directorio | `customers/page.tsx` | Medio |
| 15 | Hacer funcional el Kill-Switch de IA en Settings | `settings/page.tsx` | Bajo |
| 16 | Agregar columna "Método de pago aceptado" en Admin Console | `business_settings` + UI | Medio |

### 🟢 Fase 4 — Blindaje y Escalabilidad (Semana 4-5)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 17 | Agregar allowlist regex en proxy.ts | `proxy.ts` | Bajo |
| 18 | Migrar rate limiting a Upstash Redis | `rate-limit.ts` | Medio |
| 19 | Centralizar hardcoded URLs en helper `getAppUrl()` | `server.ts`, `client.ts`, `proxy.ts`, `middleware.ts` | Medio |
| 20 | Wrapper para `console.log` en producción | Todo el proyecto | Medio |
| 21 | Sprint 3.3: Eliminar `any` y `@ts-ignore` | `route.ts` (assistant), `tools.ts`, etc. | Alto |

### 🔵 Fase 5 — Landing y Onboarding (Semana 5-6)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 22 | Agregar sección comercial a landing + formulario con industria | `page.tsx`, `PublicHero.tsx`, `ContactForm.tsx` | Medio |
| 23 | Agregar sección de servicios dinámica en tenant landing | `[domain]/page.tsx` | Bajo |
| 24 | Hacer configurable el Manifesto desde Console | `DynamicManifesto.tsx`, `AiSettingsForm.tsx` | Bajo |
| 25 | Agregar gestión de whitelist en HQ | `TenantsDirectoryTable.tsx` + nueva sección | Medio |

### 🟣 Fase 6 — Features Premium (Semana 6-8)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 26 | Implementar módulo WhatsApp Autopilot (chatbot real) | Nuevo módulo | Alto |
| 27 | Sistema de referidos con tracking real | `store/page.tsx`, DB `tenants.referrals_count` | Medio |
| 28 | Dominios personalizados para tenants | `proxy.ts`, DNS config | Alto |
| 29 | Recordatorios automáticos (antes de módulo WhatsApp) | Nuevo: notificaciones push/email | Medio |

---

## 📋 Checklist de Validación Pre-Lanzamiento

Antes de vender al primer cliente real:

- [ ] **Build pasa**: `npm run build` Exit 0
- [ ] **Sin `console.log` en producción**: Todos envueltos en check de entorno
- [ ] **Sin `any`/`@ts-ignore`**: Todos tipados correctamente
- [ ] **Price IDs unificados**: WalletDashboard ↔ checkout ↔ webhook
- [ ] **PseudoIA funcional**: Guía paso a paso con depósito
- [ ] **Cola de aprobación**: Dueño puede confirmar/rechazar citas
- [ ] **Temporizador 30 min**: Horarios se liberan automáticamente
- [ ] **Métricas reales**: Dashboard sin placeholders
- [ ] **proxy.ts allowlist**: Solo subdominios válidos
- [ ] **Cookie domain dinámico**: No hardcodeado
- [ ] **Whitelist 100% DB-backed**: Sin fallback hardcodeado
- [ ] **Whitelist gestionable desde HQ**
- [ ] **Landing sin link "Sign in" público**
- [ ] **Contact form con campo industria**
- [ ] **Sistema de referidos tracking real**
- [ ] **Stripe webhook idempotencia verificada**
- [ ] **Rate limiting operativo** (in-memory o Redis)
- [ ] **Documentación de API actualizada**

---

## ⚠️ Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Cliente nunca paga el anticipo → horarios bloqueados | Alta | Medio | Temporizador 30 min automático |
| Dueño no revisa cola de aprobación → clientes esperan | Media | Alto | Notificación WhatsApp (link) + badge en Dashboard |
| Tokens se agotan el día de más demanda | Media | Alto | Notificación predictiva al 80% de consumo |
| Stripe webhook falla → pago no procesado | Baja | Alto | Idempotencia + retry + panel de verificación en HQ |
| Cliente sube comprobante falso | Media | Medio | El dueño revisa manualmente y confirma |
| Chrome warning de Supabase domain | Alta | Bajo | Custom domain (Fase 4 del fix original, requiere Supabase Pro) |

---

*Documento generado el 15 de julio, 2026 — Basado en auditoría de código + entrevista con Geo (6 rondas de preguntas)*
