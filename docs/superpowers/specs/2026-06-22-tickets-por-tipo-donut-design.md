# Diseño · KPI "Tickets por tipo" (donut)

Fecha: 2026-06-22

## Objetivo

Añadir un KPI nuevo —**Tickets por tipo**— a la fila de charts del dashboard, entre
"Tickets por hora" y "Top Clientes", visualizado como **donut por porciones**
(anillo con etiquetas y porcentaje). El tipo procede del campo de formulario de
Zendesk `26672700540829` (valores: Formación, Incidencia Dev, Incidencia Soporte,
Consulta técnica, Comercial, Funcionalidad, Otros, Integración TPV, Facturación).

Para hacer sitio se elimina el bloque "Carga · abiertos ahora" (buckets de clientes
con >3 / 2-3 / 1 tickets abiertos) que hoy ocupa media tarjeta de Top Clientes.

## Decisiones de producto

| Decisión | Valor |
|---|---|
| Periodo | **Este mes** (creados desde el día 1), coherente con "Top Clientes · creados este mes" |
| Nº de porciones | **Top 5 tipos + "Otros"** (resto agregado) |
| Reparto de la fila | **Horario 2 / Tipo 1 / Clientes 1** (`grid-cols-4`) |
| Tickets sin tipo | **Excluidos** del donut; se cuenta sobre `N` clasificados |
| Origen del dato | Workflow **heavy** (`KPIs Soporte - Webhook`), refresh 10 min |
| Aplicación del cambio n8n | En n8n vía MCP + reexportar el `.json` al repo (toca producción, requiere OK) |

## Arquitectura

Sin cambios estructurales. Se reutiliza el pipeline existente:

- **n8n heavy** genera el cache slim (`cached_payload`) que el frontend pinta.
- El frontend (`index.html`, vanilla JS) lee el cache vía webhook y renderiza.

### Flujo de datos del nuevo KPI

```
zd_hist (28-56 días, tickets completos)
  └─ monthRes = histRes.filter(created >= month_ymd)   [ya existe]
       └─ NUEVO: agrupar por custom_field 26672700540829
            └─ tickets_by_type  →  slim cache  →  applyHeavyData()  →  donut
```

## Componente 1 · n8n heavy (`n8n-workflow-kpis-soporte.json`)

**Nodo "Agregar KPIs"** — añadir cálculo a partir de `monthRes` (ya disponible):

1. Por cada ticket de `monthRes`, leer `custom_fields` y buscar `{ id: 26672700540829 }`.
2. Si `value` es nulo/vacío → descartar (excluir sin tipo).
3. Acumular conteo por `value` (tag).
4. Mapear tag → etiqueta legible:
   - `formacion` → Formación
   - `incidencia_dev` → Incidencia Dev
   - `incidencia_soporte` → Incidencia Soporte
   - `consulta_técnica` → Consulta técnica
   - `comercial_` → Comercial
   - `funcionalidad` → Funcionalidad
   - `otros` → Otros
   - `integracion_tpv` → Integración TPV
   - `facturacion` → Facturación
   - (tag desconocido) → usar el propio tag capitalizado, defensivo
5. Ordenar desc por count; tomar top 5; el resto se suma en una porción **"Otros"**.
6. Calcular `pct` de cada porción sobre `total_clasificados`.

**Salida** (forma del campo nuevo):

```json
"tickets_by_type": {
  "total_clasificados": 123,
  "slices": [
    { "label": "Incidencia Soporte", "count": 40, "pct": 33 },
    { "label": "Consulta técnica",   "count": 28, "pct": 23 },
    { "label": "Funcionalidad",      "count": 20, "pct": 16 },
    { "label": "Incidencia Dev",     "count": 18, "pct": 15 },
    { "label": "Formación",          "count": 10, "pct": 8  },
    { "label": "Otros",              "count": 7,  "pct": 6  }
  ]
}
```

**Nodo slim** — en la lista `KEEP`:
- Añadir `'tickets_by_type'`.
- Quitar `'orgs_by_open_count_summary'` (ya no se pinta; coherente con la regla de cache slim).

**Cero llamadas nuevas a Zendesk**: se reutiliza `zd_hist`, ya cargado. El custom field
viaja dentro de cada objeto ticket del Search API.

## Componente 2 · Frontend layout (`index.html`)

Sección de charts (actualmente líneas ~434-494):

- `<section>` pasa de `grid-cols-3` a `grid-cols-4`.
- Gráfico horario: `col-span-2`.
- **Tarjeta nueva** "Tickets por tipo" (`col-span-1`) con `<div id="typeChart">` y un
  subtítulo discreto tipo "este mes · N clasificados".
- Top Clientes (`col-span-1`): se elimina el `grid grid-cols-2` interno y el bloque
  "Carga · abiertos ahora" completo (los tres `div` de buckets rose/amber/emerald).
  "Creados este mes" (`#topOrgs`) pasa a ocupar toda la tarjeta.

## Componente 3 · Frontend render (`index.html`, script)

- Nueva función `renderTicketsByType(data)`:
  - Instancia ApexCharts tipo `donut`.
  - Patrón anti-fuga existente: variable global para la instancia + `try{ chart.destroy() }catch(_){}` antes de recrear (igual que `hourlyChart`).
  - Series = `slices.map(s => s.count)`; labels = `slices.map(s => s.label)`.
  - Etiquetas con `%`, leyenda legible en TV, hueco central (donut), paleta alineada
    al design system (primarios `#adc6ff` y variantes ya usadas en otros charts).
- `applyHeavyData(d)`:
  - Añadir `if (d.tickets_by_type) renderTicketsByType(d.tickets_by_type);`
  - Eliminar las 3 líneas `setNum('kpiOrgsGt3'…)`, `kpiOrgs2_3`, `kpiOrgs1` y la lectura
    de `orgs_by_open_count_summary`.

## Manejo de errores / casos borde

- `tickets_by_type` ausente o `slices` vacío → no renderizar (o placeholder "Sin datos"),
  sin romper el resto del `applyHeavyData`.
- `total_clasificados === 0` → mostrar estado vacío discreto.
- Tag no mapeado → se pinta capitalizado, no se pierde el ticket.

## Verificación

- Frontend: abrir el dashboard con un payload de prueba que incluya `tickets_by_type`
  y confirmar que el donut pinta, que Top Clientes ocupa toda su tarjeta, y que no
  quedan referencias a los IDs de buckets eliminados.
- n8n: ejecutar el workflow heavy en n8n (vía MCP, ejecución manual) y comprobar que
  `tickets_by_type` aparece en el output y en el cache slim, y que el tamaño del slim
  sigue siendo razonable.
- Sin regresiones de fugas: la instancia del donut se destruye antes de recrear.

## Fuera de alcance

- No se toca el workflow light (el donut es "este mes", se sirve desde el heavy).
- No se añade el donut por semana/día ni interactividad (drill-down).
- No se reintroduce el dato de "abiertos por cliente" en otro sitio.
