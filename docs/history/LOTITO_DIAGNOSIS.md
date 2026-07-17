# Lotito Diagnosis - Issues & Fixes

**Fecha:** 14 de julio, 2026  
**Estado:** DIAGNÓSTICO COMPLETADO  

---

## 🔍 Problemas Identificados

### 1. Tenant Resolution (CRÍTICO)
**Problema:** Cuando accedes desde `localhost:3000`, no se resuelve ningún tenant.

**Código problemático (route.ts:67-73):**
```typescript
const hostTenant = resolveTenantFromHost(req.headers.get('host'));
const { tenantId: resolvedTenant, mismatch } = reconcileTenantId(hostTenant, bodyTenantId);

if (mismatch) {
  return NextResponse.json({ error: 'tenantId does not match the request origin' }, { status: 403 });
}
```

**Efecto:** Sin tenant resuelto → Sin tools de agendamiento → Asistente en modo "demo"

**Solución:** Permitir modo demo con tools básicos O forzar tenantId en testing.

---

### 2. Token Validation (CRÍTICO)
**Problema:** Si el tenant no tiene tokens, el asistente rechaza cualquier interacción.

**Código problemático (route.ts:109-119):**
```typescript
const remaining = Math.max(0, limit - used);
if (remaining <= 0) {
  if (isAdmin) {
    return NextResponse.json({ reply: "⚠️ Has alcanzado el límite de tokens..." });
  } else {
    return NextResponse.json({ reply: "beep boop... Fui desconectado temporalmente..." });
  }
}
```

**Efecto:** Si `ai_token_limit` es 0 o `ai_tokens_used` >= `ai_token_limit`, no funciona.

**Solución:** Verificar que el tenant tenga tokens suficientes.

---

### 3. Trial Validation (CRÍTICO)
**Problema:** Si el trial expiró y no se pagó, el asistente no funciona.

**Código problemático (route.ts:93-103):**
```typescript
const isExpiredTrial = new Date() > trialEndsAt;
const isPaid = tenantData?.setup_fee_paid === true;

if (isExpiredTrial && !isPaid) {
  return NextResponse.json({ reply: "⚠️ Tu periodo de prueba ha expirado..." });
}
```

**Efecto:** Si `trial_ends_at` pasó y `setup_fee_paid` es false, no funciona.

**Solución:** Verificar estado de trial y pago.

---

### 4. Frontend Tool Calls (MEDIO)
**Problema:** La tool `open_booking_modal` se llama pero no hay implementación clara.

**Código problemático (AiAssistantChat.tsx:87-91):**
```typescript
if (data.toolCalls && data.toolCalls.length > 0) {
  data.toolCalls.forEach((tool: any) => {
    if (tool.name === 'open_booking_modal') {
      openModal(tool.arguments);  // ← Zustand store
    }
  });
}
```

**Efecto:** El modal de booking puede no abrirse correctamente.

**Solución:** Verificar que `useBookingStore` esté correctamente implementado.

---

## 🔧 Fixes Necesarios

### Fix 1: Agregar modo demo funcional
```typescript
// En route.ts, después de resolveTenant
if (!hasTenant) {
  // Modo demo - permitir tools básicas
  tools.check_availability = tool({ ... });
  tools.book_appointment = tool({ ... });
}
```

### Fix 2: Verificar tokens antes de retornar error
```typescript
// Agregar verificación de configuración del tenant
if (!settings) {
  return NextResponse.json({ 
    reply: "⚠️ El negocio no está configurado correctamente." 
  });
}
```

### Fix 3: Agregar logging para debug
```typescript
console.log('[Lotito] Tenant:', tenantId);
console.log('[Lotito] Tokens:', used, '/', limit);
console.log('[Lotito] Trial:', trialEndsAt, 'Paid:', isPaid);
```

---

## 📋 Pasos para Debug

1. **Verificar configuración del tenant**
   - ¿Existe `business_settings` para el tenant?
   - ¿Tiene `opening_time` y `closing_time`?
   - ¿Tiene `ai_token_limit` configurado?

2. **Verificar tokens**
   - ¿Cuántos tokens tiene el tenant?
   - ¿Cuántos ha usado?
   - ¿El límite es mayor a 0?

3. **Verificar trial**
   - ¿Cuándo expira el trial?
   - ¿Se ha pagado el setup fee?

4. **Probar API directamente**
   ```bash
   curl -X POST http://localhost:3000/api/assistant \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "text": "Hola"}], "tenantId": "TU_TENANT_ID"}'
   ```

---

## 🎯 Prioridad de Fixes

| Fix | Esfuerzo | Impacto |
|-----|----------|---------|
| Modo demo funcional | Bajo | Muy Alto |
| Verificar configuración | Bajo | Alto |
| Agregar logging | Bajo | Medio |
| Fix frontend tools | Medio | Medio |

---

**Última actualización:** 14 de julio, 2026
