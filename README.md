# KPIs Soporte Técnico · Dashboard TV 4K

Dashboard de KPIs para TV 4K (16:9) que consume datos de **Zendesk** y **Asana** a través de un **webhook de n8n**.

## Estructura

- `index.html` — Dashboard único, sin build, listo para servir.
- `n8n-workflow-kpis-soporte.json` — Workflow de n8n importable.

## Cómo funciona

```
[TV 4K] --(GET cada 10 min)--> [n8n webhook] --(paralelo)--> [Zendesk API + Asana API]
                                       │
                                       └── Agrega y devuelve JSON único
```

Una sola petición por ciclo → render limpio, sin estados intermedios.

## 1. Importar el workflow en n8n

1. n8n → **Workflows** → **Import from File** → seleccionar `n8n-workflow-kpis-soporte.json`.
2. En cada nodo HTTP de Zendesk, sustituir `soporteyurest.zendesk.com` por tu subdominio real.
3. Vincular credenciales:
   - Zendesk: en los 8 nodos HTTP de Zendesk (selector "Credential for Zendesk API").
   - Asana: en el nodo placeholder de Asana.
4. **Activar** el workflow.
5. Copiar la URL de producción del webhook: `https://n8n-soporte.data.yurest.dev/webhook/kpis-soporte`.

### Test rápido

```bash
curl https://n8n-soporte.data.yurest.dev/webhook/kpis-soporte | jq .
```

Debe devolver un JSON con `tickets_today`, `tickets_week`, `heatmap`, etc.

## 2. Configurar el frontend

Editar `index.html` línea ~120:

```js
const N8N_WEBHOOK_URL = 'https://n8n-soporte.data.yurest.dev/webhook/kpis-soporte';
```

## 3. Publicar la web

Opciones (cualquiera vale, es un único archivo):

- **Cloudflare Pages / Netlify / Vercel**: arrastrar la carpeta. Gratis y con HTTPS.
- **Servidor propio**: `python3 -m http.server 8080` o copiar a Nginx/Apache.
- **Mismo n8n host**: servir desde un proxy estático.

## 4. Configurar la TV

- Navegador en kiosk mode apuntando a la URL.
- El layout se autoescala desde un canvas base de 1920×1080 a cualquier resolución (Full HD, 4K…), siempre 16:9 sin deformar.
- Refresco automático cada 10 min (configurable en `REFRESH_MS`).

### Chrome en kiosk (ejemplo)

```bash
chrome --kiosk --noerrdialogs --disable-infobars --incognito \
  --app=https://kpis.tu-dominio.com
```

## KPIs implementados

| KPI | Fuente | Notas |
|---|---|---|
| Tickets creados hoy | Zendesk search `created>=hoy` | + delta vs ayer |
| Tickets esta semana | Zendesk search `created>=lunes` | + delta vs semana anterior |
| Tickets abiertos | Zendesk `status<solved` | pendientes mostrados aparte |
| Tickets de integración | Zendesk `tags:integracion` | ajustar tag al tuyo |
| Heatmap por hora (7 días) | Zendesk últimos 7 días | matriz 7×24, agrupado en cliente |
| Top organizaciones | Agregado desde tickets abiertos | ver TODO abajo |
| Top ticket | Último actualizado, no resuelto | |
| Asana abiertas / vencidas | Asana API | nodo placeholder, ver TODO |

## TODO / mejoras opcionales

- **Resolver nombres de organizaciones**: hoy el dashboard muestra `Organización <id>`. Añadir un nodo que llame a `/api/v2/organizations/show_many.json?ids=...` y mapear.
- **Asana real**: el workflow incluye un nodo placeholder. Sustituir por consulta a `/projects/{id}/tasks` con tu project_gid; en "Agregar KPIs" calcular `asana_open` y `asana_overdue` (due_on < hoy y `completed=false`).
- **Caché**: si las llamadas a Zendesk tardan, añadir un nodo `Cache` o programar el workflow en un cron cada 10 min que escriba a Postgres y servir desde ahí.
- **Más KPIs**: CSAT, primer tiempo de respuesta, SLA cumplidos. Avísame con los campos exactos y lo añado.

## Seguridad (acceso público)

La URL del webhook es pública. Sugerencias mínimas:
- Añadir un parámetro `?token=XXX` en el webhook (n8n permite validarlo).
- Limitar por IP en tu reverse proxy si la TV tiene IP fija.
- No exponer datos sensibles en los `subject` mostrados.
