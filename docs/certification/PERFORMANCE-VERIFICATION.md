# Performance Verification — ETAP 45-D · Zadanie 7

**Data:** 2026-08-06  
**Gate:** **CONDITIONAL**  
**STATIC:** **STATIC VERIFIED**  
**RUNTIME:** **NOT VERIFIED**

> **STATIC** = bundle size, wiring scan. **RUNTIME** = bootstrap ms, render, FPS w przeglądarce.

## Warstwy

| Warstwa | Werdykt |
|---------|---------|
| **STATIC** | **STATIC VERIFIED** |
| **RUNTIME** | **NOT VERIFIED** (undefined pending · undefined pass) |
| **Gate** | **CONDITIONAL** |

## Metryki

| Metryka | Warstwa | Wartość | Próg | Status |
|---------|---------|---------|------|--------|
| Bootstrap (shell PWA) | runtime | 48.58 ms | ≤ 120 ms | NOT VERIFIED |
| Listenery at boot | runtime | 31 | ≤ 45 | NOT VERIFIED |
| Timery at boot | runtime | 0 | ≤ 8 | NOT VERIFIED |
| Obserwery at boot | runtime | 0 | ≤ 3 | NOT VERIFIED |
| Pamięć — legacy bundle | static | 4.48 MB | ≤ 5.5 MB | STATIC VERIFIED |
| Render Home (wiring) | runtime | — ms | ≤ 150 ms | NOT VERIFIED |
| Render Map (wiring) | runtime | — ms | ≤ 800 ms | NOT VERIFIED |
| Render Producer (wiring) | runtime | — ms | ≤ 300 ms | NOT VERIFIED |
| Health Monitor render sample | runtime | — ms | ≤ 150 ms | NOT VERIFIED |
| FPS podczas przewijania (Virtual User) | runtime | — FPS | ≥ 30 | NOT VERIFIED |
| Pamięć — leak detection (Virtual User) | runtime | — MB | ≤ 25 MB | NOT VERIFIED |

## Bootstrap (ETAP 42F)

| | Before | After |
|---|--------|-------|
| bootstrapMs | 427.58 | **48.58** |
| Listeners | 52 | **31** |
| Timery | 39 | **0** |
| Obserwery | 3 | **0** |
| Oszczędność boot | — | **379 ms (-88.6%)** |

## Widoki (złożoność statyczna)

| Widok | LOC | KB | Listeners | Timery | Observers |
|-------|-----|-----|-----------|--------|-----------|
| Home | 1826 | 80 | 11 | 1 | 0 |
| Map | 3569 | 127 | 26 | 11 | 1 |
| Producer | 1594 | 64 | 14 | 3 | 0 |

## Pamięć

| Asset | Rozmiar |
|-------|---------|
| legacy bundle | 4.48 MB |
| diag shell (boot) | 80 KB |
| diag lazy (PIN) | 360 KB |

## Bramki automatyczne

| Test | Status |
|------|--------|
| bootstrap-report | ✅ PASS |
| bootstrap | ✅ PASS |
| css-performance | ✅ PASS |

## Pomiar w przeglądarce

```javascript
// W przeglądarce (localhost / ?dev=1) — pomiar render + FPS scroll:
async function rgPerfProbe() {
  const m = (label, fn) => {
    const t0 = performance.now();
    return Promise.resolve(fn()).then(() => ({
      label,
      ms: Math.round(performance.now() - t0)
    }));
  };
  const out = {};
  out.bootstrap = __RG_BOOTSTRAP__?.report?.()?.timings;
  out.home = await m('render Home', () => navigateTo('home', { force: true }));
  await new Promise(r => setTimeout(r, 400));
  out.map = await m('render Map', () => navigateTo('map', { force: true }));
  await new Promise(r => setTimeout(r, 800));
  const p = window.__RG_PRODUCERS__?.[0] || document.querySelector('[data-producer-id]');
  if (p?.id || p?.dataset?.producerId) {
    const id = p.id || p.dataset.producerId;
    out.producer = await m('open Producer', () => import('./views/producerModal.js').then(m => m.openProducerModal(id)));
  }
  out.memory = performance.memory ? {
    usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
    totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576)
  } : null;
  navigateTo('home', { force: true });
  await new Promise(r => setTimeout(r, 300));
  let frames = 0, t = performance.now();
  const el = document.querySelector('.home-page') || document.getElementById('app');
  for (let i = 0; i < 20; i++) { el?.scrollBy?.(0, 120); await new Promise(r => requestAnimationFrame(r)); frames++; }
  out.fpsScroll = Math.round(frames / ((performance.now() - t) / 1000));
  console.table(out);
  return out;
}
```

## RUNTIME — pomiar w przeglądarce

- **Bootstrap** — ≤120 ms · __RG_BOOTSTRAP__.report()
- **Render Home** — <150 ms · rgPerfProbe() · Performance tab
- **Render Map** — <800 ms · navigateTo map · Leaflet tile load
- **Render Producer** — <300 ms · openProducerModal · modal paint
- **FPS scroll** — ≥30 · __RG_VIRTUAL__.run() lub rgPerfProbe()
- **Memory leak** — ≤+25 MB · performance.memory · sesja Virtual User

---
*ETAP 43-T7 · autoApply=false · uruchom: `npm run check:performance`*
