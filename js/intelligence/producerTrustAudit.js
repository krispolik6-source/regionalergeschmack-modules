/**
 * ETAP 33C — Producer Trust Audit
 * Codzienna kontrola jakości danych producentów → Trust Score 0–100.
 *
 * autoFix=false · nie poprawia danych · tylko raport docs/trust/latest.md
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getContentProducers } from '../data/contentProducers.js';
import { createModulePolicy } from './policy.js';

export const POLICY = createModulePolicy({
    userFacing: false,
    role: 'producer-trust-audit',
    etapa: '33C'
});

export const CHECK_IDS = Object.freeze([
    'phone',
    'www',
    'openingHours',
    'coordinates',
    'photos',
    'products',
    'duplicates'
]);

const WEIGHTS = Object.freeze({
    phone: 15,
    www: 12,
    openingHours: 15,
    coordinates: 18,
    photos: 15,
    products: 15,
    /** baza za obecność nazwy / id — reszta z checks */
    identity: 10
});

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
}

function hasText(value) {
    return Boolean(String(value ?? '').trim());
}

function normPhone(value) {
    return String(value || '').replace(/[^\d+]/g, '');
}

function normWww(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
}

function normName(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isPlaceholderPhoto(url) {
    const value = String(url || '');
    if (!value) return true;
    if (value.includes('/assets/images/backgrounds/')) return true;
    if (value.includes('/assets/images/categories/')) return true;
    if (value.includes('/category_')) return true;
    return false;
}

function collectPhotoUrls(producer) {
    const urls = [];
    if (hasText(producer.image)) urls.push(String(producer.image).trim());
    if (hasText(producer.photo)) urls.push(String(producer.photo).trim());
    if (Array.isArray(producer.photos)) {
        for (const item of producer.photos) {
            const url = typeof item === 'string' ? item : item?.url;
            if (hasText(url)) urls.push(String(url).trim());
        }
    }
    return [...new Set(urls)];
}

function getProducts(producer) {
    if (Array.isArray(producer.products)) return producer.products;
    if (Array.isArray(producer.productList)) return producer.productList;
    return [];
}

/**
 * @param {object} producer
 */
export function checkPhone(producer) {
    const raw = producer.phone || producer.tel || '';
    if (!hasText(raw)) {
        return { ok: false, score: 0, detail: 'brak telefonu' };
    }
    const digits = normPhone(raw).replace(/\D/g, '');
    if (digits.length < 6) {
        return { ok: false, score: 4, detail: 'telefon zbyt krótki / podejrzany' };
    }
    if (digits.length < 8) {
        return { ok: true, score: 10, detail: 'telefon obecny (krótki)' };
    }
    return { ok: true, score: WEIGHTS.phone, detail: 'telefon OK' };
}

/**
 * @param {object} producer
 */
export function checkWww(producer) {
    const raw = producer.website || producer.url || producer.www || '';
    if (!hasText(raw)) {
        return { ok: false, score: 0, detail: 'brak www' };
    }
    const v = String(raw).trim();
    if (!/^https?:\/\//i.test(v) && !/^[\w.-]+\.[a-z]{2,}/i.test(v)) {
        return { ok: false, score: 3, detail: 'www nie wygląda na URL' };
    }
    return { ok: true, score: WEIGHTS.www, detail: 'www OK' };
}

/**
 * @param {object} producer
 */
export function checkOpeningHours(producer) {
    const raw = producer.openingHours || producer.hours || producer.opening_hours || '';
    if (!hasText(raw)) {
        return { ok: false, score: 0, detail: 'brak godzin otwarcia' };
    }
    const text = String(raw).trim();
    if (text.length < 4) {
        return { ok: false, score: 3, detail: 'godziny zbyt lakoniczne' };
    }
    // prosta heurystyka: cyfra lub dzień tygodnia
    if (!/\d/.test(text) && !/(mo|di|mi|do|fr|sa|so|mon|tue|wed|thu|fri|sat|sun|pn|wt|śr|cz|pt|sob|nd)/i.test(text)) {
        return { ok: true, score: 8, detail: 'godziny obecne (słaba struktura)' };
    }
    return { ok: true, score: WEIGHTS.openingHours, detail: 'godziny otwarcia OK' };
}

/**
 * @param {object} producer
 */
export function checkCoordinates(producer) {
    const lat = Number(producer.lat ?? producer.latitude);
    const lng = Number(producer.lng ?? producer.lon ?? producer.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { ok: false, score: 0, detail: 'brak współrzędnych' };
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return { ok: false, score: 0, detail: 'współrzędne poza zakresem' };
    }
    if (lat === 0 && lng === 0) {
        return { ok: false, score: 2, detail: 'współrzędne (0,0) — podejrzane' };
    }
    // Niemcy / region roughly
    if (lat < 47 || lat > 56 || lng < 5 || lng > 16) {
        return { ok: true, score: 12, detail: 'współrzędne poza typowym DE (akceptowane)' };
    }
    return { ok: true, score: WEIGHTS.coordinates, detail: 'współrzędne OK' };
}

/**
 * @param {object} producer
 */
export function checkPhotos(producer) {
    const urls = collectPhotoUrls(producer);
    if (!urls.length) {
        return { ok: false, score: 0, detail: 'brak zdjęć' };
    }
    const real = urls.filter((u) => !isPlaceholderPhoto(u));
    if (!real.length) {
        return {
            ok: false,
            score: 5,
            detail: 'tylko placeholder / zdjęcie kategorii'
        };
    }
    if (real.length === 1) {
        return { ok: true, score: 11, detail: '1 zdjęcie obiektu' };
    }
    return { ok: true, score: WEIGHTS.photos, detail: `${real.length} zdjęć` };
}

/**
 * @param {object} producer
 */
export function checkProducts(producer) {
    const products = getProducts(producer);
    if (!products.length) {
        return { ok: false, score: 0, detail: 'brak produktów' };
    }
    const named = products.filter((p) => hasText(p?.name) || hasText(p?.id) || hasText(p?.slug));
    if (!named.length) {
        return { ok: false, score: 3, detail: 'produkty bez nazw' };
    }
    if (named.length === 1) {
        return { ok: true, score: 8, detail: '1 produkt' };
    }
    if (named.length < 3) {
        return { ok: true, score: 12, detail: `${named.length} produkty` };
    }
    return { ok: true, score: WEIGHTS.products, detail: `${named.length} produktów` };
}

/**
 * Wykrywa grupy duplikatów (nie usuwa).
 * @param {object[]} producers
 * @returns {Map<string, string[]>} id → lista id duplikatów
 */
export function findDuplicateGroups(producers) {
    /** @type {Map<string, string[]>} */
    const dupes = new Map();
    const list = Array.isArray(producers) ? producers : [];

    for (let i = 0; i < list.length; i += 1) {
        const a = list[i];
        const aId = String(a?.id || `idx-${i}`);
        for (let j = i + 1; j < list.length; j += 1) {
            const b = list[j];
            const bId = String(b?.id || `idx-${j}`);
            const reasons = [];

            const phoneA = normPhone(a?.phone);
            const phoneB = normPhone(b?.phone);
            if (phoneA && phoneB && phoneA.length >= 8 && phoneA === phoneB) {
                reasons.push('phone');
            }

            const wwwA = normWww(a?.website || a?.url);
            const wwwB = normWww(b?.website || b?.url);
            if (wwwA && wwwB && wwwA === wwwB) {
                reasons.push('www');
            }

            const nameA = normName(a?.name);
            const nameB = normName(b?.name);
            const latA = Number(a?.lat);
            const lngA = Number(a?.lng);
            const latB = Number(b?.lat);
            const lngB = Number(b?.lng);
            if (
                nameA && nameB && nameA === nameB
                && Number.isFinite(latA) && Number.isFinite(lngA)
                && Number.isFinite(latB) && Number.isFinite(lngB)
                && haversineKm(latA, lngA, latB, lngB) < 0.15
            ) {
                reasons.push('name+coords');
            } else if (nameA && nameB && nameA === nameB && !Number.isFinite(latA)) {
                reasons.push('name');
            }

            if (!reasons.length) continue;
            const prevA = dupes.get(aId) || [];
            const prevB = dupes.get(bId) || [];
            if (!prevA.includes(bId)) prevA.push(bId);
            if (!prevB.includes(aId)) prevB.push(aId);
            dupes.set(aId, prevA);
            dupes.set(bId, prevB);
            // annotate reason on side channel via map of pair keys — stored in detail later
            dupes.set(`__reason__:${aId}:${bId}`, reasons);
        }
    }
    return dupes;
}

/**
 * @param {object} producer
 * @param {Map<string, string[]>} dupes
 */
export function scoreProducerTrust(producer, dupes = new Map()) {
    const id = String(producer?.id || producer?.name || 'unknown');
    const checks = {
        phone: checkPhone(producer),
        www: checkWww(producer),
        openingHours: checkOpeningHours(producer),
        coordinates: checkCoordinates(producer),
        photos: checkPhotos(producer),
        products: checkProducts(producer)
    };

    let points = hasText(producer?.name) || hasText(producer?.id) ? WEIGHTS.identity : 0;
    const issues = [];

    for (const key of ['phone', 'www', 'openingHours', 'coordinates', 'photos', 'products']) {
        const c = checks[key];
        points += c.score;
        if (!c.ok) issues.push(`${key}: ${c.detail}`);
    }

    const dupeIds = (dupes.get(id) || []).filter((x) => !String(x).startsWith('__'));
    let duplicatePenalty = 0;
    if (dupeIds.length) {
        duplicatePenalty = Math.min(25, 10 + dupeIds.length * 5);
        points -= duplicatePenalty;
        issues.push(`duplicates: ${dupeIds.join(', ')}`);
        checks.duplicates = {
            ok: false,
            score: -duplicatePenalty,
            detail: `możliwy duplikat z: ${dupeIds.join(', ')}`,
            peers: dupeIds
        };
    } else {
        checks.duplicates = {
            ok: true,
            score: 0,
            detail: 'brak wykrytych duplikatów',
            peers: []
        };
    }

    const trustScore = clamp(points);
    let band = 'low';
    if (trustScore >= 85) band = 'high';
    else if (trustScore >= 70) band = 'good';
    else if (trustScore >= 50) band = 'fair';
    else if (trustScore >= 30) band = 'weak';

    return {
        id,
        name: String(producer?.name || id),
        source: producer?.source || null,
        category: producer?.category || null,
        trustScore,
        band,
        checks,
        issues,
        duplicatePenalty,
        duplicatePeers: dupeIds
    };
}

/**
 * @param {object[]} producers
 * @param {object} [meta]
 */
export function buildTrustAuditReport(producers = [], meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const list = Array.isArray(producers) ? producers.filter(Boolean) : [];
    const dupes = findDuplicateGroups(list);
    const rows = list.map((p) => scoreProducerTrust(p, dupes));
    rows.sort((a, b) => a.trustScore - b.trustScore || a.name.localeCompare(b.name));

    const scores = rows.map((r) => r.trustScore);
    const avg = scores.length
        ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const failing = {
        phone: rows.filter((r) => !r.checks.phone.ok).length,
        www: rows.filter((r) => !r.checks.www.ok).length,
        openingHours: rows.filter((r) => !r.checks.openingHours.ok).length,
        coordinates: rows.filter((r) => !r.checks.coordinates.ok).length,
        photos: rows.filter((r) => !r.checks.photos.ok).length,
        products: rows.filter((r) => !r.checks.products.ok).length,
        duplicates: rows.filter((r) => !r.checks.duplicates.ok).length
    };

    return {
        id: `producer-trust-${day}`,
        title: 'Producer Trust Audit — Trust Score',
        etapa: '33C',
        generatedAt: new Date().toISOString(),
        day,
        reason: meta.reason || 'cli-trust',
        policy: { ...POLICY },
        summary: {
            producersScanned: rows.length,
            averageTrustScore: avg,
            minTrustScore: scores.length ? Math.min(...scores) : 0,
            maxTrustScore: scores.length ? Math.max(...scores) : 0,
            high: rows.filter((r) => r.band === 'high').length,
            good: rows.filter((r) => r.band === 'good').length,
            fair: rows.filter((r) => r.band === 'fair').length,
            weak: rows.filter((r) => r.band === 'weak' || r.band === 'low').length,
            failingChecks: failing
        },
        producers: rows,
        notes: [
            'autoFix=false — żadnych zmian w danych producentów.',
            'Raport wyłącznie do odczytu.',
            'Duplikaty: wykrywanie po telefonie / www / nazwa+współrzędne (<150 m).'
        ]
    };
}

/**
 * @param {ReturnType<typeof buildTrustAuditReport>} report
 */
export function trustAuditToMarkdown(report) {
    const s = report.summary;
    const lines = [];
    lines.push('# Producer Trust Audit — Trust Score');
    lines.push('');
    lines.push(`**Dzień:** ${report.day}`);
    lines.push(`**Wygenerowano:** ${report.generatedAt}`);
    lines.push(`**Etap:** ${report.etapa}`);
    lines.push(`**Powód:** ${report.reason}`);
    lines.push('');
    lines.push('## Polityka');
    lines.push('');
    lines.push('- **autoFix:** false — nie poprawia danych');
    lines.push('- **autoApply:** false');
    lines.push('- Tylko raport · bez UI · bez mutacji producentów');
    lines.push('');
    lines.push('## Podsumowanie');
    lines.push('');
    lines.push(`| Metryka | Wartość |`);
    lines.push(`|---------|---------|`);
    lines.push(`| Producentów | ${s.producersScanned} |`);
    lines.push(`| **Średni Trust Score** | **${s.averageTrustScore} / 100** |`);
    lines.push(`| Min / Max | ${s.minTrustScore} / ${s.maxTrustScore} |`);
    lines.push(`| high / good / fair / weak | ${s.high} / ${s.good} / ${s.fair} / ${s.weak} |`);
    lines.push('');
    lines.push('### Braki wg kontroli');
    lines.push('');
    lines.push('| Kontrola | Liczba braków |');
    lines.push('|----------|--------------:|');
    for (const id of CHECK_IDS) {
        lines.push(`| ${id} | ${s.failingChecks[id] ?? 0} |`);
    }
    lines.push('');
    lines.push('## Trust Score — każdy producent');
    lines.push('');
    lines.push('| Score | Band | Producent | Id | Problemy |');
    lines.push('|------:|------|-----------|----|----------|');
    for (const p of report.producers) {
        const problems = p.issues.length ? p.issues.join('; ') : '—';
        lines.push(`| ${p.trustScore} | ${p.band} | ${p.name.replace(/\|/g, '/')} | \`${p.id}\` | ${problems.replace(/\|/g, '/')} |`);
    }
    lines.push('');
    lines.push('## Szczegóły kontroli (skrót)');
    lines.push('');
    for (const p of report.producers) {
        lines.push(`### ${p.name} — **${p.trustScore}/100** (${p.band})`);
        lines.push('');
        lines.push('| Check | OK | Pts | Detail |');
        lines.push('|-------|----|----:|--------|');
        for (const id of CHECK_IDS) {
            const c = p.checks[id];
            if (!c) continue;
            lines.push(`| ${id} | ${c.ok ? 'yes' : 'no'} | ${c.score} | ${c.detail} |`);
        }
        lines.push('');
    }
    lines.push('## Notatki');
    lines.push('');
    for (const n of report.notes || []) lines.push(`- ${n}`);
    lines.push('');
    return lines.join('\n');
}

/**
 * @param {string} root
 */
export function loadProducersForAudit(root) {
    /** @type {object[]} */
    let list = [];
    try {
        list = [...getContentProducers()];
    } catch {
        list = [];
    }

    const snapPath = join(root, 'docs/trust/producers-snapshot.json');
    if (existsSync(snapPath)) {
        try {
            const raw = JSON.parse(readFileSync(snapPath, 'utf8'));
            const extra = Array.isArray(raw) ? raw : raw?.producers;
            if (Array.isArray(extra) && extra.length) {
                const byId = new Map(list.map((p) => [String(p.id), p]));
                for (const p of extra) {
                    if (!p) continue;
                    const id = String(p.id || '');
                    if (id && byId.has(id)) continue;
                    list.push(p);
                }
            }
        } catch {
            /* ignore corrupt snapshot */
        }
    }
    return list;
}

/**
 * @param {string} root
 * @param {object} [options]
 */
export function runProducerTrustAudit(root, options = {}) {
    const producers = options.producers || loadProducersForAudit(root);
    const report = buildTrustAuditReport(producers, {
        day: options.day,
        reason: options.reason || 'cli-trust'
    });
    const md = trustAuditToMarkdown(report);
    const outDir = join(root, 'docs', 'trust');
    mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, 'latest.md');
    writeFileSync(outFile, md, 'utf8');
    // JSON pomocniczy dla CLI/testów (nie mutuje danych producentów)
    writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(join(outDir, `${report.day}.md`), md, 'utf8');
    return { report, md, outFile };
}

export default {
    POLICY,
    CHECK_IDS,
    checkPhone,
    checkWww,
    checkOpeningHours,
    checkCoordinates,
    checkPhotos,
    checkProducts,
    findDuplicateGroups,
    scoreProducerTrust,
    buildTrustAuditReport,
    trustAuditToMarkdown,
    loadProducersForAudit,
    runProducerTrustAudit
};
