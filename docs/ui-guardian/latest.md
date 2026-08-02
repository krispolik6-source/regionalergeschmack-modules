# ETAP 41 — UI Guardian

**Werdykt:** PASS  
**Data:** 2026-08-01

## Cel

Co kilka sekund (`~4 s`) skanuje UI i wykrywa problemy prezentacji — m.in. taki jak niewidoczny napis **„Opowieści regionu”** w trybie nocnym.

## Checklista

| Check | Opis |
|-------|------|
| offscreen | elementy poza ekranem |
| text-visible | napisy widoczne |
| contrast | stosunek kontrastu WCAG-ish |
| touch-44 | przyciski min. 44px |
| overflow | overflow dokumentu / kart |
| safe-area | notch / home indicator |
| popup-bounds | modal / menu / leaflet popup |
| card-clip | karty ucięte |

## Soft-heal (stan DOM)

- kontrast → inline `color`
- overflow → `overflow-x: clip`
- touch → `min-height: 44px`
- popup → `max-width/max-height`

Bez zmiany Store / EventBus / API / Leaflet core. Bez sieci.

## Naprawa przykładowa (CSS)

Dark mode dla `.home-region-story-label` / `-sub` (region-story + ux-polish).

## API

```js
__RG_UI_GUARDIAN__.run()
__RG_UI_GUARDIAN__.findings()
__RG_UI_GUARDIAN__.last()
__RG_UI_GUARDIAN__.clear()
```

Store: `localStorage.rg_ui_guardian_v1`
