# KPI "Tickets por tipo" (donut) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un donut "Tickets por tipo" (este mes) entre el gráfico horario y Top Clientes, eliminando el bloque "Carga · abiertos ahora".

**Architecture:** El workflow n8n heavy agrupa `monthRes` (tickets del mes, ya cargados) por el custom field `26672700540829` y emite `tickets_by_type` en el cache slim. El frontend lo pinta con un donut ApexCharts. Sin llamadas nuevas a Zendesk.

**Tech Stack:** HTML estático + vanilla JS + ApexCharts (frontend); n8n Code node (JavaScript) editado vía MCP n8n.

**Spec:** `docs/superpowers/specs/2026-06-22-tickets-por-tipo-donut-design.md`

---

## Notas de proceso (reglas del proyecto)

- No hay tests automatizados: la verificación es **manual** (inyección de mock en consola del navegador + ejecución manual del workflow en n8n).
- **No commitear sin OK del usuario.** Estamos en `main`: crear rama antes de empezar.
- Tocar el workflow en n8n cuenta como producción: el paso de n8n requiere confirmación explícita del usuario en el momento.
- Editar `n8n-workflow-kpis-soporte.json` se hace **reexportando desde n8n**, no a mano.

### Paso previo: rama de trabajo

- [ ] Crear rama
```bash
cd "/Users/alexander/Downloads/Informe Zendesk"
git checkout -b feat/tickets-por-tipo
```

---

## File Structure

- `index.html` — único archivo de frontend. Sección charts (~434-494) y bloque script (~561, ~931).
- `n8n-workflow-kpis-soporte.json` — workflow heavy; se regenera por reexport tras editar en n8n.

---

## Task 1: Frontend — layout de la fila (HTML)

**Files:**
- Modify: `index.html` (sección charts, ~434-494)

- [ ] **Step 1: Cambiar el grid de la fila a 4 columnas**

Reemplazar la apertura de la sección (línea ~434):

```html
  <section class="grid grid-cols-3 gap-6 px-10 mt-3 flex-1 min-h-0">
```

por:

```html
  <section class="grid grid-cols-4 gap-6 px-10 mt-3 flex-1 min-h-0">
```

- [ ] **Step 2: Insertar la tarjeta del donut entre el gráfico horario y Top Clientes**

Tras el cierre de la tarjeta HOURLY (la `</div>` de la línea ~442, justo antes del comentario `<!-- CLIENTES: ... -->`), insertar:

```html
    <!-- TICKETS POR TIPO · donut, este mes -->
    <div class="card p-4 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between mb-2 shrink-0">
        <div class="text-2xl font-bold">Tickets por tipo</div>
        <div class="text-sm text-slate-400">este mes</div>
      </div>
      <div id="typeChart" class="flex-1 min-h-0"></div>
    </div>
```

- [ ] **Step 3: Simplificar Top Clientes (quitar "Carga · abiertos ahora")**

Reemplazar el cuerpo de la tarjeta Top Clientes. Bloque actual (~445-493):

```html
    <div class="card p-4 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between mb-2 shrink-0">
        <div class="text-2xl font-bold">Top Clientes</div>
      </div>
      <div class="grid grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
        <div class="flex flex-col min-h-0">
          <div class="text-xs title text-slate-400 mb-1 shrink-0">Creados este mes</div>
          <div id="topOrgs" class="flex-1 overflow-hidden flex flex-col gap-1 scrollable min-h-0"></div>
        </div>
        <div class="flex flex-col min-h-0">
          <div class="text-xs title text-slate-400 mb-1 shrink-0">Carga · abiertos ahora</div>
          ... (los tres buckets rose/amber/emerald) ...
        </div>
      </div>
    </div>
```

por (solo "Creados este mes", a tarjeta completa):

```html
    <div class="card p-4 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between mb-2 shrink-0">
        <div class="text-2xl font-bold">Top Clientes</div>
        <div class="text-sm text-slate-400">creados este mes</div>
      </div>
      <div id="topOrgs" class="flex-1 overflow-hidden flex flex-col gap-1 scrollable min-h-0"></div>
    </div>
```

Esto elimina los `div` con `id="kpiOrgsGt3"`, `id="kpiOrgs2_3"`, `id="kpiOrgs1"`.

- [ ] **Step 4: Verificar layout en el navegador**

Abrir `index.html` (con `! open index.html` o el flujo de preview habitual). Esperado: la fila muestra 3 tarjetas (horario ancho, "Tickets por tipo" vacía en medio, "Top Clientes" estrecha). Sin errores en consola por IDs faltantes todavía (los IDs se referencian en JS; se arregla en Task 2 — puede haber un error en `applyHeavyData` hasta entonces, es esperado).

---

## Task 2: Frontend — render del donut (JS)

**Files:**
- Modify: `index.html` (declaración de charts ~561; `applyHeavyData` ~931-942)

- [ ] **Step 1: Declarar la instancia global del donut**

Tras la línea `let hourlyChart = null;` (~561) añadir:

```js
  let typeChart = null;        // instancia del donut "Tickets por tipo" (destruir antes de re-render)
```

- [ ] **Step 2: Añadir la función de render del donut**

Inmediatamente después de `renderHourly` (antes de `renderStacked`, ~660), añadir:

```js
  // === Tickets por tipo (donut) ===
  function renderTicketsByType(data) {
    const container = document.getElementById('typeChart');
    if (!container) return;
    const slices = (data && Array.isArray(data.slices)) ? data.slices : [];
    // Patrón anti-fuga: destruir la instancia previa antes de recrear.
    if (typeChart) { try { typeChart.destroy(); } catch(_) {} typeChart = null; }
    if (!slices.length) {
      container.innerHTML = '<div class="text-slate-500 text-sm h-full flex items-center justify-center">Sin datos</div>';
      return;
    }
    const total = data.total_clasificados ?? slices.reduce((a,s) => a + s.count, 0);
    const options = {
      chart: {
        type:'donut', height:'100%', width:'100%', background:'transparent',
        foreColor:'#c2c6d6', fontFamily:'Bw Modelica, sans-serif', animations:{ enabled:false }
      },
      series: slices.map(s => s.count),
      labels: slices.map(s => s.label),
      colors: ['#adc6ff','#b4a7ff','#4edea3','#ffb786','#ffb4ab','#8c909f'],
      stroke: { width: 0 },
      legend: { position:'bottom', fontSize:'13px', labels:{ colors:'#e1e2ec' }, markers:{ size:8 } },
      dataLabels: {
        enabled: true,
        formatter: v => Math.round(v) + '%',
        style:{ fontSize:'13px', fontWeight:700, colors:['#0b0e14'] }
      },
      plotOptions: { pie: { donut: { size:'62%', labels: {
        show:true,
        total:{ show:true, label:'Total', fontSize:'13px', color:'#c2c6d6',
                formatter: () => String(total) }
      } } } },
      tooltip: { y: { formatter: v => v + ' tickets' } }
    };
    typeChart = new ApexCharts(container, options);
    typeChart.render();
  }
```

- [ ] **Step 3: Conectar en `applyHeavyData` y quitar la lógica de buckets**

En `applyHeavyData` (~931-942), reemplazar:

```js
    renderTopOrgs(d.top_orgs || [], { containerId: 'topOrgs', sparkline: true });
    // Clientes por carga de tickets abiertos (3 buckets).
    const oc = d.orgs_by_open_count_summary || {};
    setNum('kpiOrgsGt3',  oc.gt3         ?? 0);
    setNum('kpiOrgs2_3',  oc.between_2_3 ?? 0);
    setNum('kpiOrgs1',    oc.eq1         ?? 0);
```

por:

```js
    renderTopOrgs(d.top_orgs || [], { containerId: 'topOrgs', sparkline: true });
    // Tickets por tipo del mes (donut).
    if (d.tickets_by_type) renderTicketsByType(d.tickets_by_type);
```

Actualizar también el comentario de la función (~930) de "charts + top orgs + tipos cliente" a "charts + top orgs + tipos de ticket".

- [ ] **Step 4: Verificar el donut con datos mock en consola**

Abrir el dashboard, y en la consola del navegador ejecutar:

```js
renderTicketsByType({ total_clasificados: 123, slices: [
  { label:'Incidencia Soporte', count:40, pct:33 },
  { label:'Consulta técnica',   count:28, pct:23 },
  { label:'Funcionalidad',      count:20, pct:16 },
  { label:'Incidencia Dev',     count:18, pct:15 },
  { label:'Formación',          count:10, pct:8  },
  { label:'Otros tipos',        count:7,  pct:6  }
]});
```

Esperado: donut con 6 porciones, % en cada sector, "Total 123" en el centro, leyenda abajo. Ejecutarlo dos veces seguidas y confirmar (en la pestaña Memory/Elements) que no se acumulan SVGs — la instancia previa se destruye.

---

## Task 3: n8n heavy — calcular `tickets_by_type` (vía MCP) ⚠ producción

> Requiere OK explícito del usuario antes de ejecutar (toca el workflow en producción).

**Files:**
- Modify en n8n (no a mano): nodo **"Agregar KPIs"** y nodo **slim** del workflow `KPIs Soporte - Webhook`.
- Modify por reexport: `n8n-workflow-kpis-soporte.json`.

- [ ] **Step 1: Localizar el workflow y leer su estado actual**

Usar n8n MCP: `n8n_list_workflows` → encontrar "KPIs Soporte - Webhook"; `n8n_get_workflow` con su id. Confirmar que el nodo "Agregar KPIs" contiene `monthRes` y que el `return` final es el objeto con `top_orgs`, `orgs_by_open_count_summary`, etc.

- [ ] **Step 2: Insertar el cálculo en el nodo "Agregar KPIs"**

Justo **antes** del `return [{ json: {` final del nodo, insertar:

```js
// ────── Tickets por tipo del mes (custom field 26672700540829) ──────
const TYPE_FIELD_ID = 26672700540829;
const TYPE_LABELS = {
  formacion: 'Formación',
  incidencia_dev: 'Incidencia Dev',
  incidencia_soporte: 'Incidencia Soporte',
  'consulta_técnica': 'Consulta técnica',
  comercial_: 'Comercial',
  funcionalidad: 'Funcionalidad',
  otros: 'Otros',
  integracion_tpv: 'Integración TPV',
  facturacion: 'Facturación'
};
function typeLabel(tag){
  if (TYPE_LABELS[tag]) return TYPE_LABELS[tag];
  return String(tag).replace(/_+$/,'').replace(/_/g,' ').replace(/^\w/, c => c.toUpperCase());
}
const typeCount = new Map();
for (const t of monthRes) {
  const cf = Array.isArray(t.custom_fields)
    ? t.custom_fields.find(f => f && Number(f.id) === TYPE_FIELD_ID) : null;
  const val = cf && cf.value;
  if (!val) continue;                 // excluir tickets sin tipo
  typeCount.set(val, (typeCount.get(val) || 0) + 1);
}
const _typeTotal = [...typeCount.values()].reduce((a,b)=>a+b,0);
const _typeSorted = [...typeCount.entries()].sort((a,b)=>b[1]-a[1]);
const _TYPE_TOP_N = 5;
const _typeTop  = _typeSorted.slice(0, _TYPE_TOP_N);
const _typeRest = _typeSorted.slice(_TYPE_TOP_N).reduce((a,[,c])=>a+c,0);
const _pct = n => _typeTotal ? Math.round((n / _typeTotal) * 100) : 0;
const _typeSlices = _typeTop.map(([tag,count]) => ({ label: typeLabel(tag), count, pct: _pct(count) }));
// La cola agregada se llama "Otros tipos" para no chocar con la categoría real "Otros".
if (_typeRest > 0) _typeSlices.push({ label: 'Otros tipos', count: _typeRest, pct: _pct(_typeRest) });
const tickets_by_type = { total_clasificados: _typeTotal, slices: _typeSlices };
```

Y en el objeto del `return` final, añadir la clave (junto a `top_orgs`):

```js
  top_orgs,
  tickets_by_type,
```

- [ ] **Step 3: Actualizar el nodo slim (KEEP)**

En el nodo slim, en el array `KEEP`:
- Añadir `'tickets_by_type'`.
- Quitar `'orgs_by_open_count_summary'` (ya no se pinta).

Resultado en la sección de charts del KEEP:

```js
  // Charts y agrupaciones que pinta el frontend
  'hourly_today', 'weekly_stacked', 'top_orgs', 'tickets_by_type',
  'incidencias_buckets'
```

- [ ] **Step 4: Aplicar y probar en n8n**

Aplicar con `n8n_update_partial_workflow` (ediciones quirúrgicas por nodo). Ejecutar el workflow manualmente (`n8n_test_workflow` o ejecución manual del Schedule). Esperado: el output del nodo "Agregar KPIs" contiene `tickets_by_type` con `slices` no vacío y `total_clasificados` > 0; el nodo slim lo incluye y ya no incluye `orgs_by_open_count_summary`.

- [ ] **Step 5: Reexportar el workflow al repo**

Exportar el workflow actualizado desde n8n y sobrescribir `n8n-workflow-kpis-soporte.json`. **Antes de sobrescribir**, abrir el archivo actual y confirmar que es el mismo workflow (regla del proyecto: mirar antes de pisar). Confirmar con `git diff` que el cambio se limita a los dos nodos editados.

---

## Task 4: Verificación end-to-end y commit

- [ ] **Step 1: Verificación integrada**

Con el cache ya poblado por el heavy (tras el Step 4 de Task 3), recargar el dashboard apuntando al webhook real (o servir el cache). Esperado: el donut pinta con datos reales del mes, "Top Clientes" ocupa toda su tarjeta, sin errores en consola.

- [ ] **Step 2: Revisar el diff**

```bash
git diff --stat
git diff index.html
```
Confirmar: `index.html` (layout + render + applyHeavyData) y `n8n-workflow-kpis-soporte.json` (dos nodos). Sin cambios colaterales.

- [ ] **Step 3: Commit (pedir OK al usuario primero)**

```bash
git add index.html n8n-workflow-kpis-soporte.json docs/superpowers/
git commit -m "feat: KPI 'Tickets por tipo' (donut) y retirada de 'Carga abiertos'"
```

---

## Self-review (cobertura del spec)

- Periodo este mes → Task 3 usa `monthRes`. ✓
- Top 5 + cola agregada → Task 3 Step 2 (`_TYPE_TOP_N = 5`, "Otros tipos"). ✓
- Excluir sin tipo → Task 3 Step 2 (`if (!val) continue`). ✓
- Reparto 2/1/1 → Task 1 (`grid-cols-4`, horario `col-span-2`). ✓
- Donut estilo captura → Task 2 (donut ApexCharts, % y total central). ✓
- Quitar "Carga · abiertos ahora" → Task 1 Step 3 (HTML) + Task 2 Step 3 (JS) + Task 3 Step 3 (cache). ✓
- Cero llamadas nuevas a Zendesk → Task 3 reutiliza `monthRes`. ✓
- Anti-fuga de memoria → Task 2 Step 2 (`destroy()` antes de recrear). ✓
