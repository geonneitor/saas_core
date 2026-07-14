# saas_core Premium Upgrade Spec

**Fecha:** 14 de julio, 2026  
**Objetivo:** Elevar saas_core al nivel "Premium" que tenía Zen  
**Estado:** ESPECIFICACIÓN V2 - FASES REDEFINIDAS  

---

## 🎯 Visión del Producto

### Contexto
- **Zen:** Web app completa, ya usada por personas reales
- **Zen tenía:** Asistente pseudo-IA guiado paso a paso (NO chat libre)
- **saas_core:** Evolución multi-tenant con IA real (Lotito)
- **Objetivo:** Multi-vertical (barberías, salones, clínicas, tatuajes)

### Estado Actual (Julio 14)
- ✅ **Lotito funcional** - API route, tools, handlers, build pasa
- ✅ **Secret admin route** (/thisisn0tasecret)
- ✅ **Magic link auth** con whitelist
- ✅ **Tokens prepago** (billetera)
- ✅ **Stripe checkout** para setup fee y tokens

---

## 📋 Priorización por Fases

### 🔴 Fase 1: Auto-Configuración desde Google Maps (AHORA)
| Feature | Esfuerzo | Impacto | Dependencias |
|---------|----------|---------|-------------|
| API de búsqueda Google Places | Bajo | Alto | Google API Key |
| API de detalles Google Places | Bajo | Alto | Google API Key |
| AutoConfigWizard (búsqueda + formulario) | Medio | Muy Alto | API routes |
| Guardar configuración en business_settings | Bajo | Alto | Actions existentes |
| Previsualización en tiempo real | Medio | Alto | Componente |

**Descripción:**
El vendedor/admin busca el negocio en Google Maps, se auto-llenan los datos (nombre, dirección, horarios), ajusta detalles manualmente y guarda. El dueño ve su página ya preconfigurada.

**Flujo:**
1. Admin busca negocio por nombre en Google Maps
2. Sistema obtiene: nombre, dirección, horarios, coordenadas
3. Admin ajusta datos y agrega tagline
4. Guarda en `business_settings`
5. La landing page del tenant ya tiene los datos

---

### 🟠 Fase 2: Onboarding Premium
| Feature | Esfuerzo | Impacto |
|---------|----------|---------|
| Wizard de onboarding paso a paso | Medio | Alto |
| Preview en tiempo real | Medio | Alto |
| Configuración de servicios con precios | Medio | Alto |
| Selección de tema/colores | Bajo | Medio |
| Publicar landing (go-live) | Bajo | Alto |

---

### 🟡 Fase 3: Agendamiento Premium
| Feature | Esfuerzo | Impacto |
|---------|----------|---------|
| Bloqueo temporal de horarios | Alto | Muy Alto |
| Recordatorios WhatsApp | Medio | Alto |
| Cobro anticipado | Medio | Alto |
| Calendar visual pulido | Medio | Alto |

---

### 🟢 Fase 4: UX Premium Console
| Feature | Esfuerzo | Impacto |
|---------|----------|---------|
| Rediseño landing page principal | Medio | Alto |
| Rediseño console tenant | Medio | Alto |
| Dashboard con métricas reales | Medio | Alto |
| Gestión de clientes con historial | Medio | Alto |

---

## 🔧 Arquitectura de Auto-Configuración (Fase 1)

### API Routes
```typescript
// POST /api/places/search
// Busca negocios en Google Places API
Input:  { query: string }
Output: { results: Array<{ placeId, name, address, rating }> }

// POST /api/places/details  
// Obtiene detalles de un lugar
Input:  { placeId: string }
Output: { name, address, phone, hours[], lat, lng, website }
```

### Componente AutoConfigWizard
```
┌─────────────────────────────────────┐
│ 🔍 Auto-Configuración del Negocio   │
│                                     │
│  Paso 1: Buscar en Google Maps      │
│  ┌──────────────────────────────┐   │
│  │ Buscar negocio...            │   │
│  └──────────────────────────────┘   │
│  Resultados:                        │
│  ┌──────────────────────────────┐   │
│  │ 🏪 Barbería El Campeón       │   │
│  │    Av. Reforma 123, CDMX     │   │
│  │    ⭐ 4.5                    │   │
│  └──────────────────────────────┘   │
│                                     │
│  ─── o ingresa manual ───          │
│                                     │
│  Paso 2: Revisar y ajustar          │
│  Nombre: [Barbería El Campeón    ]  │
│  Dirección: [Av. Reforma 123     ]  │
│  Horarios: [Lun-Vie 9:00-18:00  ]  │
│  Tagline: [El mejor corte...     ]  │
│                                     │
│  [💾 Guardar Configuración]         │
└─────────────────────────────────────┘
```

### Base de datos
Usa la tabla `business_settings` existente:
- `opening_time`, `closing_time` → horarios
- `latitude`, `longitude` → coordenadas
- `brand_tagline` → mensaje de bienvenida
- `name` (en tabla `tenants`) → nombre del negocio

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Auto-configuración completa | < 2 minutos por negocio |
| Tasa de adopción del wizard | > 80% de nuevos tenants |
| Satisfacción del vendedor | Setup rápido y preciso |

---

**Próximos Pasos (Inmediatos):**
1. ✅ Crear API routes de Google Places
2. ✅ Crear AutoConfigWizard component
3. Integrar en flujo de creación de tenant
4. Probar el flujo completo
