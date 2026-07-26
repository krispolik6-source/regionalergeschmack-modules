Raport nocny – Regionaler Smak 2026-07-21

Odbiorca: krispolik6@gmail.com
Harmonogram: codziennie 03:03 (Europe/Berlin)
Wygenerowano: 2026-07-21T20:35:01.730Z

========== HEALTH ==========
Overall: 96%
CLI: OK (178ms)
  performance: 99%
  ux: 85%
  accessibility: 100%
  memory: 99%
  dataQuality: 100%
  translation: 84%
  mobile: 100%
  pwa: 100%

Błędy / findings (wysokie):
• brak

========== SELF-HEAL ==========
CLI: OK (37ms)
Naprawy / OK:
• index.html bez ??
• ikona menu ☰ OK
• mapowanie sklepów → category_shops
• mood: sklep nie dziedziczy pasieki
• moduł selfHealing.js obecny
• modal photo 160px
• initSelfHealing w app.js
Problemy pozostałe:
• brak

========== GUARDIAN ==========
CLI: OK (4587ms)
Status: —
Findings: 23
Ostrzeżenia:
• Możliwy race async→DOM: js/core/pwaInstall.js
• Możliwy race async→DOM: js/core/sideMenu.js
• Możliwy race async→DOM: js/diagnostics/developerDashboard.js
• Możliwy race async→DOM: js/diagnostics/developerVaultPanel.js
• Możliwy race async→DOM: js/diagnostics/healthDevPanel.js
• Możliwy race async→DOM: js/diagnostics/realUserSimulation.js
• Wykryto min-height < 40px (cele dotykowe)
• Mało dynamicznych import()
Błędy:
• check-translations zakończony błędem
• Duży łączny JS: 1863 KB

========== PERFORMANCE ==========
Health performance: 99%
Wynik: 99% (OK)
Guardian performance:
• Duży łączny JS: 1863 KB
• Leaflet ładowany z shella
• Legacy bundle: 644 KB
• Mało dynamicznych import()

========== WYSYŁKA ==========
SMTP: SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_FROM)

Polityka: autoFix=false · Brand Lock · bez Store/EventBus/API/GPS/Leaflet