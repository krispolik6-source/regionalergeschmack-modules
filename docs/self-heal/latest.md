# Self-Heal — latest

**ETAP 39** · 2026-07-23 · **PASS**

Pełny raport: [ETAP-39-SELF-HEALING.md](./ETAP-39-SELF-HEALING.md)

## Runtime

```js
__RG_SELF_HEAL__.run()
__RG_SELF_HEAL__.healMap()
__RG_SELF_HEAL__.healEventBus()
__RG_SELF_HEAL__.healSw()
__RG_SELF_HEAL__.log()
```

## Polityka

- Naprawia **tylko stan** (DOM / Leaflet / listenery / LS position / SW prompt)
- **Nie** przepisuje kodu źródłowego
- Brand Lock · logo-master jako placeholder obrazów
- SW: propozycja odświeżenia, bez cichego `skipWaiting`
