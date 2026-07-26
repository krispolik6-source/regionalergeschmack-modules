/**
 * ETAP 33B — User Taste Profile (lokalne uczenie)
 *
 * Anonimowo, tylko lokalnie, bez Internetu.
 * Wylicza Taste Profile + Return Probability.
 * Zapisuje wyłącznie docs/intelligence/user-profile.md
 *
 * autoApply=false · bez UI · bez nowych okien · bez chatbota.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createModulePolicy } from './policy.js';

export const POLICY = createModulePolicy({
    network: false,
    sendToInternet: false,
    anonymous: true,
    userFacing: false,
    newScreens: false,
    role: 'user-taste-profile',
    etapa: '33B',
    storageNote: 'Sygnały tylko lokalne (snapshot / localStorage w przeglądarce). CLI nie wysyła nic poza zapisem raportu MD.'
});

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
    }
    return null;
}

function topEntries(map, limit = 6) {
    return Object.entries(map || {})
        .filter(([k]) => k && k !== 'undefined')
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id, score]) => ({ id: String(id), score: Math.round(Number(score) * 10) / 10 }));
}

/**
 * Normalizuje surowy snapshot lokalny (learning model / export) do wspólnego kształtu.
 * @param {object|null} raw
 */
export function normalizeLocalSnapshot(raw = null) {
    const empty = {
        source: 'empty',
        signalCount: 0,
        updatedAt: 0,
        categories: {},
        producers: {},
        products: {},
        hours: {},
        visits: [],
        distancesKm: [],
        routes: []
    };
    if (!raw || typeof raw !== 'object') return empty;

    const categories = { ...(raw.categories || {}) };
    const producers = { ...(raw.producers || {}) };
    const products = { ...(raw.products || {}) };
    const hours = { ...(raw.hours || {}) };

    // Affinity z Learning Engine
    if (raw.affinity) {
        for (const c of raw.affinity.topCategories || []) {
            if (c?.id) categories[c.id] = Math.max(categories[c.id] || 0, Number(c.score) || 1);
        }
        for (const p of raw.affinity.topProducers || []) {
            if (p?.id) producers[p.id] = Math.max(producers[p.id] || 0, Number(p.score) || 1);
        }
        for (const p of raw.affinity.topProducts || []) {
            if (p?.id) products[p.id] = Math.max(products[p.id] || 0, Number(p.score) || 1);
        }
        for (const h of raw.affinity.peakHours || []) {
            const key = String(h.hour ?? h.id);
            if (key) hours[key] = Math.max(hours[key] || 0, Number(h.score) || 1);
        }
    }

    const visits = [];
    if (Array.isArray(raw.visits)) {
        for (const v of raw.visits) {
            if (!v) continue;
            visits.push({
                id: String(v.id || v.producerId || ''),
                at: Number(v.at) || 0,
                category: v.category ? String(v.category).slice(0, 40) : null
            });
        }
    }
    if (Array.isArray(raw.history?.visited)) {
        for (const v of raw.history.visited) {
            visits.push({
                id: String(v.id || ''),
                at: Number(v.at) || 0,
                category: v.category ? String(v.category).slice(0, 40) : null
            });
        }
    }
    if (Array.isArray(raw.history?.viewed)) {
        for (const v of raw.history.viewed) {
            if (!visits.some((x) => x.id === String(v.id))) {
                visits.push({
                    id: String(v.id || ''),
                    at: Number(v.at) || 0,
                    category: v.category ? String(v.category).slice(0, 40) : null
                });
            }
        }
    }

    const distancesKm = [];
    if (Array.isArray(raw.distancesKm)) {
        for (const d of raw.distancesKm) {
            const n = Number(d);
            if (Number.isFinite(n) && n >= 0 && n < 500) distancesKm.push(n);
        }
    }
    if (Array.isArray(raw.routes)) {
        for (const r of raw.routes) {
            const d = num(r.distanceKm, r.km, r.distance);
            if (d != null && d >= 0 && d < 500) distancesKm.push(d);
        }
    }

    const signalCount = num(raw.signalCount, Object.keys(categories).length
        + Object.keys(producers).length
        + Object.keys(products).length
        + visits.length) ?? 0;

    return {
        source: raw.source || (raw.version != null ? 'learning-model' : 'snapshot'),
        signalCount,
        updatedAt: Number(raw.updatedAt) || 0,
        categories,
        producers,
        products,
        hours,
        visits: visits.filter((v) => v.id).sort((a, b) => b.at - a.at).slice(0, 24),
        distancesKm,
        routes: Array.isArray(raw.routes) ? raw.routes.slice(0, 40) : []
    };
}

/**
 * Średni dystans podróży (km) — tylko z lokalnych pomiarów.
 * @param {ReturnType<typeof normalizeLocalSnapshot>} snap
 */
export function averageTravelDistanceKm(snap) {
    const list = snap.distancesKm || [];
    if (!list.length) return null;
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    return Math.round(avg * 10) / 10;
}

/**
 * @param {ReturnType<typeof normalizeLocalSnapshot>} snap
 */
export function buildTasteProfile(snap) {
    const favoriteCategories = topEntries(snap.categories, 6);
    const topFarms = topEntries(snap.producers, 8);
    const favoriteProducts = topEntries(snap.products, 8);
    const preferredHours = topEntries(snap.hours, 5).map((x) => ({
        hour: Number(x.id),
        score: x.score
    })).filter((x) => Number.isFinite(x.hour));

    const recentVisits = (snap.visits || []).slice(0, 10).map((v) => ({
        producerId: v.id,
        at: v.at || null,
        category: v.category || null
    }));

    const avgKm = averageTravelDistanceKm(snap);

    const diversity = favoriteCategories.length;
    const depth = snap.signalCount;
    let confidence = 12;
    if (depth >= 3) confidence += 18;
    if (depth >= 12) confidence += 20;
    if (depth >= 40) confidence += 15;
    if (favoriteCategories.length) confidence += 10;
    if (topFarms.length) confidence += 10;
    if (preferredHours.length) confidence += 8;
    if (avgKm != null) confidence += 7;
    confidence = clamp(confidence);

    let label = 'cold-start';
    if (confidence >= 70 && favoriteCategories[0]) {
        label = `local-${favoriteCategories[0].id}`;
    } else if (confidence >= 45) {
        label = 'forming';
    } else if (depth > 0) {
        label = 'sparse';
    }

    // Prosty wektor smaku (anonimowy)
    const vector = {};
    for (const c of favoriteCategories) {
        vector[c.id] = clamp((c.score / (favoriteCategories[0]?.score || 1)) * 100);
    }

    return {
        label,
        confidence,
        anonymous: true,
        network: false,
        favoriteCategories,
        mostVisitedFarms: topFarms,
        averageTravelDistanceKm: avgKm,
        preferredHours,
        favoriteProducts,
        recentVisits,
        tasteVector: vector,
        signalCount: snap.signalCount,
        updatedAt: snap.updatedAt || null
    };
}

/**
 * Prawdopodobieństwo powrotu 0–100 — wyłącznie z lokalnych sygnałów.
 * @param {ReturnType<typeof normalizeLocalSnapshot>} snap
 * @param {ReturnType<typeof buildTasteProfile>} taste
 */
export function computeReturnProbability(snap, taste) {
    let score = 22; // baza: nieznany użytkownik

    const cats = taste.favoriteCategories.length;
    const farms = taste.mostVisitedFarms.length;
    const hours = taste.preferredHours.length;
    const visits = taste.recentVisits.length;
    const products = taste.favoriteProducts.length;

    score += Math.min(14, cats * 3);
    score += Math.min(12, farms * 2.5);
    score += Math.min(10, products * 2);
    score += Math.min(8, hours * 2);
    score += Math.min(10, visits * 1.5);

    // Powtarzalność gospodarstw
    const topFarmScore = taste.mostVisitedFarms[0]?.score || 0;
    if (topFarmScore >= 3) score += 6;
    if (topFarmScore >= 8) score += 4;

    // Spójność godzin (preferencja czasowa = nawyk)
    if (hours >= 2) score += 4;
    if (hours >= 1 && (taste.preferredHours[0]?.score || 0) >= 4) score += 3;

    // Dystans: lokalne krótkie trasy sprzyjają powrotom
    const km = taste.averageTravelDistanceKm;
    if (km != null) {
        if (km <= 8) score += 8;
        else if (km <= 20) score += 5;
        else if (km <= 40) score += 2;
        else score -= 3;
    }

    // Recency: wizyta w ostatnich 7 dniach
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = (snap.visits || []).filter((v) => (v.at || 0) >= weekAgo).length;
    if (recent >= 1) score += 6;
    if (recent >= 3) score += 4;

    // Pewność profilu (cold start nie zawyża)
    score = score * (0.5 + 0.5 * (taste.confidence / 100));

    return clamp(score);
}

function returnBand(p) {
    if (p >= 80) return 'high';
    if (p >= 60) return 'moderate-high';
    if (p >= 40) return 'moderate';
    if (p >= 25) return 'low-moderate';
    return 'low';
}

/**
 * @param {object|null} snapshot — lokalny model / export (bez PII)
 * @param {object} [meta]
 */
export function buildUserTasteReport(snapshot = null, meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const snap = normalizeLocalSnapshot(snapshot);
    const tasteProfile = buildTasteProfile(snap);
    const returnProbability = computeReturnProbability(snap, tasteProfile);

    return {
        id: `user-taste-profile-${day}`,
        title: 'User Taste Profile — lokalne uczenie',
        etapa: '33B',
        generatedAt: new Date().toISOString(),
        day,
        reason: meta.reason || 'cli-taste-profile',
        policy: { ...POLICY },
        tasteProfile,
        returnProbability,
        returnBand: returnBand(returnProbability),
        remembered: {
            favoriteCategories: tasteProfile.favoriteCategories,
            mostVisitedFarms: tasteProfile.mostVisitedFarms,
            averageTravelDistanceKm: tasteProfile.averageTravelDistanceKm,
            preferredHours: tasteProfile.preferredHours,
            favoriteProducts: tasteProfile.favoriteProducts,
            recentVisits: tasteProfile.recentVisits
        },
        privacy: {
            anonymous: true,
            sendToInternet: false,
            pii: false,
            note: 'Brak imion, e-maili, dokładnych GPS. Identyfikatory lokalne / kategorie / godziny.'
        }
    };
}

/**
 * @param {ReturnType<typeof buildUserTasteReport>} report
 */
export function userTasteProfileToMarkdown(report) {
    const t = report.tasteProfile;
    const lines = [];
    lines.push('# User Taste Profile — lokalne uczenie');
    lines.push('');
    lines.push(`**Dzień:** ${report.day}`);
    lines.push(`**Wygenerowano:** ${report.generatedAt}`);
    lines.push(`**Etap:** ${report.etapa}`);
    lines.push(`**Powód:** ${report.reason}`);
    lines.push('');
    lines.push('## Polityka');
    lines.push('');
    lines.push('- **autoApply:** false');
    lines.push('- **Sieć:** wyłączona — nic nie jest wysyłane do Internetu');
    lines.push('- **Anonimowo:** tak (bez PII)');
    lines.push('- **UI:** bez zmian · bez nowych okien · bez chatbota');
    lines.push('');
    lines.push('## Taste Profile');
    lines.push('');
    lines.push(`| Pole | Wartość |`);
    lines.push(`|------|---------|`);
    lines.push(`| Label | \`${t.label}\` |`);
    lines.push(`| Confidence | **${t.confidence} / 100** |`);
    lines.push(`| Sygnały lokalne | ${t.signalCount} |`);
    lines.push(`| Śr. dystans podróży | ${t.averageTravelDistanceKm != null ? `${t.averageTravelDistanceKm} km` : '— (brak lokalnych pomiarów)'} |`);
    lines.push('');
    lines.push('### Ulubione kategorie');
    lines.push('');
    if (t.favoriteCategories.length) {
        for (const c of t.favoriteCategories) lines.push(`- \`${c.id}\` (${c.score})`);
    } else {
        lines.push('- _(brak — cold start / brak lokalnych sygnałów)_');
    }
    lines.push('');
    lines.push('### Najczęściej odwiedzane gospodarstwa');
    lines.push('');
    if (t.mostVisitedFarms.length) {
        for (const f of t.mostVisitedFarms) lines.push(`- \`${f.id}\` (${f.score})`);
    } else {
        lines.push('- _(brak)_');
    }
    lines.push('');
    lines.push('### Preferowane godziny');
    lines.push('');
    if (t.preferredHours.length) {
        for (const h of t.preferredHours) lines.push(`- ${String(h.hour).padStart(2, '0')}:00 (${h.score})`);
    } else {
        lines.push('- _(brak)_');
    }
    lines.push('');
    lines.push('### Ulubione produkty');
    lines.push('');
    if (t.favoriteProducts.length) {
        for (const p of t.favoriteProducts) lines.push(`- \`${p.id}\` (${p.score})`);
    } else {
        lines.push('- _(brak)_');
    }
    lines.push('');
    lines.push('### Ostatnie wizyty');
    lines.push('');
    if (t.recentVisits.length) {
        for (const v of t.recentVisits) {
            const when = v.at ? new Date(v.at).toISOString() : '—';
            lines.push(`- \`${v.producerId}\`${v.category ? ` · ${v.category}` : ''} · ${when}`);
        }
    } else {
        lines.push('- _(brak)_');
    }
    lines.push('');
    lines.push('## Return Probability');
    lines.push('');
    lines.push(`# **${report.returnProbability} / 100**`);
    lines.push('');
    lines.push(`**Pasmo:** ${report.returnBand}`);
    lines.push('');
    lines.push('Wyliczone wyłącznie z lokalnych, anonimowych sygnałów (kategorie, gospodarstwa, produkty, godziny, dystans, recency wizyt).');
    lines.push('');
    lines.push('## Privacy');
    lines.push('');
    lines.push(`- anonymous: ${report.privacy.anonymous}`);
    lines.push(`- sendToInternet: ${report.privacy.sendToInternet}`);
    lines.push(`- ${report.privacy.note}`);
    lines.push('');
    return lines.join('\n');
}

/**
 * Opcjonalny lokalny snapshot (nigdy nie fetchowany z sieci):
 * docs/intelligence/learning-snapshot.json
 * @param {string} root
 */
export function loadLocalSnapshot(root) {
    const candidates = [
        'docs/intelligence/learning-snapshot.json',
        'docs/intelligence/user-signals.local.json'
    ];
    for (const rel of candidates) {
        const full = join(root, rel);
        if (!existsSync(full)) continue;
        try {
            const data = JSON.parse(readFileSync(full, 'utf8'));
            if (data && typeof data === 'object') {
                return { ...data, source: data.source || rel };
            }
        } catch {
            /* ignore corrupt */
        }
    }
    return null;
}

/**
 * Buduje raport i zapisuje TYLKO docs/intelligence/user-profile.md
 * @param {string} root
 * @param {object} [options]
 */
export function runUserTasteProfile(root, options = {}) {
    const snapshot = options.snapshot !== undefined
        ? options.snapshot
        : loadLocalSnapshot(root);

    const report = buildUserTasteReport(snapshot, {
        day: options.day,
        reason: options.reason || (snapshot ? 'local-snapshot' : 'cold-start')
    });
    const md = userTasteProfileToMarkdown(report);
    const outDir = join(root, 'docs', 'intelligence');
    mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, 'user-profile.md');
    writeFileSync(outFile, md, 'utf8');
    return { report, md, outFile };
}

export default {
    POLICY,
    normalizeLocalSnapshot,
    buildTasteProfile,
    computeReturnProbability,
    buildUserTasteReport,
    userTasteProfileToMarkdown,
    loadLocalSnapshot,
    runUserTasteProfile,
    averageTravelDistanceKm
};
