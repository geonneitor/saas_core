<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:context-saturation-rules -->
# Context Saturation & Migration Protocol

As an AI agent, you must constantly monitor the length and complexity of the current conversation. When the chat history becomes too long, it degrades performance, consumes excessive tokens, and risks context loss.
You must proactively warn the user when the context is saturated or about to be. Say something like: *"⚠️ ALERTA DE SATURACIÓN: Este chat está consumiendo demasiados tokens y perdiendo agilidad. Por favor, genera un resumen y migremos a una nueva sesión sin que el usuario tenga que pedirlo."*
When migrating, you must generate a comprehensive "Context Transfer Prompt" that the user can paste into the new chat to instantly onboard the next agent with exact file paths, current sprint status, and next steps.
<!-- END:context-saturation-rules -->
