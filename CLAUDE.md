# CLAUDE.md — Informe Zendesk

Dashboard de KPIs de soporte Zendesk. Frontend estático (`index.html`) que consume un cache generado por workflows de n8n (`n8n-workflow-*.json`).

## Reglas de trabajo

- **Antes de sobrescribir un archivo, mira lo que hay dentro.** Si el contenido contradice lo que esperabas o no lo creaste tú, para y reporta en vez de pisar. Aplica especialmente a los `n8n-workflow-*.json` y al cache que pinta el dashboard.

- **Reporta con fidelidad, sin hedging.** Si algo está hecho y verificado, dilo en seco. Si fallaste o saltaste un paso, dilo también. Nada de "debería funcionar" o "creo que sí".

- **Toda llamada a Zendesk API o webhook n8n cuenta como publicación.** Aunque sea GET, el rate limit y los logs ya quedan. No las dispares para "probar"; pídelas si necesitas verificar algo en producción.

- **Para comandos interactivos que solo puede ejecutar el usuario** (login, OAuth, abrir n8n en el navegador), sugiere que los teclee con `! <comando>` en lugar de intentar ejecutarlos tú.

- **Si una tool falla 2-3 veces seguidas, para y pregunta.** No insistas con la misma llamada ni te vayas por tangentes.

- **Código nuevo se lee como el código de al lado.** En `index.html` la convención es vanilla JS con funciones planas y comentarios mínimos en español — no introduzcas frameworks, módulos ni cambios de estilo sin pedirlo antes.

- **Workflows n8n son frágiles para editar a mano.** Cambios en los `.json` deben ser quirúrgicos (un nodo, un campo); si algo necesita más, propón hacerlo en n8n y reexportar.

- **Cache slim:** ya está acordado que el cache solo contiene los campos que pinta el frontend (ver commit `c08e119`). No añadas campos de debug al cache sin discutirlo.

- **Una autorización es para una vez.** Si el usuario aprobó borrar/sobrescribir algo antes, vuelve a confirmar la siguiente — el "sí" no se extiende.

## Contexto técnico

- `index.html` — dashboard, vanilla JS, lee del cache slim.
- `n8n-workflow-kpis-soporte.json` — workflow principal de generación de KPIs.
- `n8n-workflow-kpis-light.json` — variante ligera (solo campos pintados).
- FRT (First Reply Time) usa `reply_time_in_minutes.business` (horario laboral). Tickets con `reply_time = 0` cuentan como respondidos al instante.
- Mes anterior incluye desglose IA/Manual para comparativa de mix.
