import fs from 'fs';
import path from 'path';
import { REPORTS_DIR } from '../config.mjs';
import { ensureDir } from './fs-utils.mjs';

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function writeReports(payload) {
    ensureDir(REPORTS_DIR);
    const stamp = payload.reportId;
    const jsonPath = path.join(REPORTS_DIR, `${stamp}.json`);
    const mdPath = path.join(REPORTS_DIR, `${stamp}.md`);
    const htmlPath = path.join(REPORTS_DIR, `${stamp}.html`);
    const patchesPath = path.join(REPORTS_DIR, `${stamp}.patches.json`);

    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(patchesPath, JSON.stringify(payload.improvement.patches, null, 2), 'utf8');
    fs.writeFileSync(mdPath, renderMarkdown(payload), 'utf8');
    fs.writeFileSync(htmlPath, renderHtml(payload), 'utf8');

    // latest shortcuts
    fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(path.join(REPORTS_DIR, 'latest.md'), renderMarkdown(payload), 'utf8');
    fs.writeFileSync(path.join(REPORTS_DIR, 'latest.html'), renderHtml(payload), 'utf8');
    fs.writeFileSync(path.join(REPORTS_DIR, 'latest.patches.json'), JSON.stringify(payload.improvement.patches, null, 2), 'utf8');

    return { jsonPath, mdPath, htmlPath, patchesPath };
}

function renderMarkdown(p) {
    const s = p.scores;
    const lines = [];
    lines.push(`# AI Guardian Report – ${p.reportId}`);
    lines.push('');
    lines.push(`Wygenerowano: ${p.generatedAt}`);
    lines.push('');
    lines.push('> Narzędzie developerskie. **Nie zmienia kodu automatycznie.** Nie commitue. Nie publikuje.');
    lines.push('');
    lines.push('## Oceny');
    lines.push('');
    lines.push(`| Obszar | Ocena |`);
    lines.push(`|--------|------:|`);
    lines.push(`| Jakość projektu | ${s.quality} / 10 |`);
    lines.push(`| UX | ${s.ux} / 10 |`);
    lines.push(`| Wydajność | ${s.performance} / 10 |`);
    lines.push(`| PWA | ${s.pwa} / 10 |`);
    lines.push(`| Dostępność | ${s.accessibility} / 10 |`);
    lines.push(`| Bezpieczeństwo | ${s.security} / 10 |`);
    lines.push(`| Gotowość produkcyjna | ${s.productionReady} / 10 |`);
    lines.push('');
    lines.push('## Podsumowanie findingów');
    lines.push('');
    const g = p.improvement.grouped;
    lines.push(`- Krytyczne: **${g.critical}**`);
    lines.push(`- Wysokie: **${g.high}**`);
    lines.push(`- Średnie: **${g.medium}**`);
    lines.push(`- Kosmetyczne: **${g.cosmetic}**`);
    lines.push('');

    for (const sev of ['critical', 'high', 'medium', 'cosmetic']) {
        const list = p.improvement.lists[sev] || [];
        if (!list.length) continue;
        lines.push(`## ${sev.toUpperCase()}`);
        lines.push('');
        for (const f of list) {
            lines.push(`### ${f.title}`);
            lines.push(`- **Przyczyna:** ${f.cause}`);
            lines.push(`- **Pliki:** ${f.files.join(', ') || '—'}`);
            lines.push(`- **Propozycja:** ${f.proposal}`);
            lines.push(`- **Wpływ na wydajność:** ${f.performanceImpact}`);
            lines.push(`- **Ryzyko regresji:** ${f.regressionRisk}`);
            lines.push('');
        }
    }

    lines.push('## Proponowane patche');
    lines.push('');
    lines.push('Status wszystkich: `proposed` — wymagana akceptacja człowieka.');
    lines.push('');
    for (const patch of p.improvement.patches.slice(0, 40)) {
        lines.push(`- \`${patch.patchId}\` [${patch.severityity}] ${patch.title}`);
    }
    lines.push('');

    if (p.learning?.ranking) {
        lines.push('## Self Learning');
        lines.push('');
        lines.push(p.learning.ranking.lesson || '');
        lines.push('');
        lines.push('### Najbardziej problematyczne pliki');
        for (const row of p.learning.ranking.mostProblematicFiles || []) {
            lines.push(`- ${row.file} (${row.count})`);
        }
        lines.push('');
    }

    lines.push('## Polityka');
    lines.push('');
    lines.push('- autoModifyCode: **false**');
    lines.push('- autoCommit: **false**');
    lines.push('- autoPublish: **false**');
    lines.push('- affectProductionUsers: **false**');
    lines.push('');
    return lines.join('\n');
}

function renderHtml(p) {
    const s = p.scores;
    const rows = p.findings.map((f) => `
      <tr class="sev-${esc(f.severityity)}">
        <td>${esc(f.severityity)}</td>
        <td>${esc(f.module)}</td>
        <td><strong>${esc(f.title)}</strong><br><small>${esc(f.cause)}</small></td>
        <td>${esc((f.files || []).join(', '))}</td>
        <td>${esc(f.proposal)}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Guardian – ${esc(p.reportId)}</title>
  <style>
    :root { --bg:#f7f1e4; --ink:#2c281e; --gold:#c4a35a; --ok:#4f6b3c; }
    body { font-family: Georgia, "Segoe UI", sans-serif; margin:0; background:var(--bg); color:var(--ink); }
    header { padding:24px 20px; background:linear-gradient(135deg,#fff8ee,#e8d5a3); border-bottom:1px solid #d4c09a; }
    h1 { margin:0 0 8px; font-size:1.5rem; }
    .policy { font-size:14px; opacity:.85; }
    main { padding:20px; max-width:1100px; margin:0 auto; }
    .scores { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:10px; margin:16px 0 24px; }
    .score { background:#fffaf2; border:1px solid #e0d0b0; border-radius:12px; padding:12px; text-align:center; }
    .score b { display:block; font-size:1.4rem; color:var(--ok); }
    table { width:100%; border-collapse:collapse; background:#fffaf2; border-radius:12px; overflow:hidden; }
    th, td { border-bottom:1px solid #eadfca; padding:10px 8px; text-align:left; vertical-align:top; font-size:13px; }
    th { background:#f0e4cc; }
    tr.sev-critical { background:#ffe8e0; }
    tr.sev-high { background:#fff0e0; }
    footer { padding:20px; font-size:12px; opacity:.75; }
  </style>
</head>
<body>
  <header>
    <h1>AI Guardian – ${esc(p.reportId)}</h1>
    <p class="policy">Dev tool lokalny · nie zmienia kodu · nie commitue · nie publikuje · ${esc(p.generatedAt)}</p>
  </header>
  <main>
    <div class="scores">
      <div class="score"><span>Jakość</span><b>${s.quality}</b></div>
      <div class="score"><span>UX</span><b>${s.ux}</b></div>
      <div class="score"><span>Wydajność</span><b>${s.performance}</b></div>
      <div class="score"><span>PWA</span><b>${s.pwa}</b></div>
      <div class="score"><span>a11y</span><b>${s.accessibility}</b></div>
      <div class="score"><span>Security</span><b>${s.security}</b></div>
      <div class="score"><span>Prod ready</span><b>${s.productionReady}</b></div>
    </div>
    <p>Krytyczne: <b>${p.improvement.grouped.critical}</b> · Wysokie: <b>${p.improvement.grouped.high}</b> ·
       Średnie: <b>${p.improvement.grouped.medium}</b> · Kosmetyczne: <b>${p.improvement.grouped.cosmetic}</b></p>
    <table>
      <thead><tr><th>Sev</th><th>Moduł</th><th>Finding</th><th>Pliki</th><th>Propozycja</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5">Brak findingów</td></tr>'}</tbody>
    </table>
    <h2>Self Learning</h2>
    <p>${esc(p.learning?.ranking?.lesson || '')}</p>
  </main>
  <footer>Patche: status proposed only. Akceptacja człowieka wymagana przed jakąkolwiek zmianą kodu.</footer>
</body>
</html>`;
}
