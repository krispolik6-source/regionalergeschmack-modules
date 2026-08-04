# Application Health Report

Generated: 2026-08-04T17:43:21.290Z
Overall: **87%**

## Scores

- **performance**: 85%
- **ux**: 85%
- **accessibility**: 100%
- **memory**: 84%
- **dataQuality**: 100%
- **translation**: 40%
- **mobile**: 100%
- **pwa**: 100%

## Findings

- **[high] translation** — Brakujące klucze i18n: 224
  - en:0, pl:0, ru:7, tr:7, fr:7, es:7, it:7, nl:7, cs:7, sk:7, hu:7, ro:7, bg:7, el:7, hr:7, sr:7, mk:0, sl:7, lt:7, lv:7, et:7, fi:7, sv:7, no:7, da:7, is:7, zh:7, zh-tw:7, ja:7, ko:7, vi:7, ms:7, id:7, th:7, hi:7
- **[low] code** — Podejrzenie nieużywanego kodu: 16 plików
  - js/core/dynamicTranslateEngine.js, js/intelligence/livingRegionAi.js, js/intelligence/producerTrustAudit.js, js/intelligence/productDirectorAi.js, js/intelligence/productIntelligenceDaily.js, js/intelligence/regionalBrain.js
- **[medium] css** — Potencjalne konflikty CSS: 40
  - body.dark-mode .producer-product-image [background]; .producer-product-image [background]; body.dark-mode .bottom-nav [background]; body [color]

## Policy

- autoFix: false
- readOnly: true
