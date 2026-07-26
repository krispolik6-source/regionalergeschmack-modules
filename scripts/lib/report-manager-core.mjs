/**
 * ETAP 34C — Developer Report Manager (core)
 * Usuwanie / lista / rozmiar wyłącznie w docs/.
 * autoApply=false · autoFix=false
 */

import {
    existsSync,
    readdirSync,
    readFileSync,
    statSync,
    unlinkSync,
    writeFileSync,
    mkdirSync
} from 'node:fs';
import { join, relative, sep, basename, dirname } from 'node:path';

/** Katalogi / pliki nigdy nietknięte (poza docs/ lub chronione w docs). */
export const NEVER_TOUCH = [
    'js/',
    'css/',
    'assets/',
    'index.html',
    'manifest.json',
    'sw.js',
    'package.json',
    'node_modules/',
    'downloads/'
];

const KEEP_DOC_NAMES = new Set([
    'readme.md',
    'developer-mail.md',
    'policy.md',
    'brand-book.md',
    'brand-protection.md',
    'instrukcja-instalacji.pdf',
    '.gitkeep'
]);

const KEEP_DOC_PREFIX = ['brand-book', 'brand-lock', 'etap-', 'prelaunch', 'prepublish'];

/** Moduły raportowe (podkatalogi docs/). */
export const REPORT_MODULES = [
    'daily',
    'health',
    'improvements',
    'virtual-user',
    'advisor',
    'quality-loop',
    'emotion',
    'living-brand',
    'product-director',
    'product-brain',
    'self-reflection',
    'guardian-future',
    'dream',
    'regional-intelligence',
    'real-users',
    'premium-weekly',
    'brand-protection',
    'logging',
    'intelligence',
    'living-region',
    'product-intelligence',
    'trust',
    'self-heal',
    'nightly',
    'home-premium',
    'store-readiness'
];

function toPosix(p) {
    return String(p || '').replace(/\\/g, '/');
}

export function normalizeRel(relPath) {
    let p = toPosix(relPath).replace(/^\/+/, '');
    while (p.startsWith('./')) p = p.slice(2);
    return p;
}

/**
 * Ścieżka musi być pod docs/ i nie może wychodzić poza root.
 * @returns {{ ok: true, rel: string, abs: string } | { ok: false, reason: string }}
 */
export function resolveSafeDocsPath(root, relPath) {
    const rel = normalizeRel(relPath);
    if (!rel || rel.includes('..')) {
        return { ok: false, reason: 'niedozwolona ścieżka (..)' };
    }
    for (const bad of NEVER_TOUCH) {
        if (rel === bad.replace(/\/$/, '') || rel.startsWith(bad)) {
            return { ok: false, reason: `chronione: ${bad}` };
        }
    }
    if (!rel.startsWith('docs/')) {
        return { ok: false, reason: 'tylko pliki w docs/' };
    }
    if (rel === 'docs' || rel === 'docs/') {
        return { ok: false, reason: 'nie można usunąć całego docs/' };
    }
    if (rel.startsWith('docs/brand/') || rel === 'docs/brand') {
        return { ok: false, reason: 'Brand Lock – docs/brand' };
    }

    const abs = join(root, ...rel.split('/'));
    const rootAbs = join(root);
    const relCheck = toPosix(relative(rootAbs, abs));
    if (!relCheck || relCheck.startsWith('..') || relCheck.includes('..')) {
        return { ok: false, reason: 'poza katalogiem projektu' };
    }
    if (!relCheck.startsWith('docs/') && relCheck !== 'docs') {
        return { ok: false, reason: 'tylko docs/' };
    }
    return { ok: true, rel: toPosix(relCheck), abs };
}

function shouldKeepDocFile(name) {
    const lower = name.toLowerCase();
    if (KEEP_DOC_NAMES.has(lower)) return true;
    if (KEEP_DOC_PREFIX.some((p) => lower.startsWith(p))) return true;
    return false;
}

export function isLatestArtifact(name) {
    return /^latest\.(md|json)$/i.test(name);
}

/** Plik raportowy nadający się do czyszczenia / listy (nie dokumentacja stała). */
export function isManagedReportFile(name) {
    const lower = name.toLowerCase();
    if (shouldKeepDocFile(name)) return false;
    if (isLatestArtifact(name)) return true;
    if (/^\d{4}-\d{2}-\d{2}/.test(name)) return true;
    if (/^\d{4}-w\d{2}/i.test(name)) return true;
    if (/^health-\d{4}/i.test(name)) return true;
    if (/\.(email|mailto)\.txt$/i.test(name)) return true;
    if (/^(production-|brand-protection|brand-consistency|visual-brand|master-icon|header-audit|logo-audit|responsive-premium|premium-audit)/i.test(lower)) {
        return true;
    }
    if (/\.(json|md|html|txt)$/i.test(name) && !shouldKeepDocFile(name)) return true;
    return false;
}

/** Auto-cleanup: nie rusza latest.md / latest.json */
export function isAutoCleanupCandidate(name) {
    if (isLatestArtifact(name)) return false;
    return isManagedReportFile(name);
}

function walkDocsFiles(root, dirAbs, out) {
    let entries;
    try {
        entries = readdirSync(dirAbs, { withFileTypes: true });
    } catch {
        return;
    }
    for (const ent of entries) {
        const full = join(dirAbs, ent.name);
        const rel = toPosix(relative(root, full));
        if (ent.isDirectory()) {
            if (rel === 'docs/brand' || rel.startsWith('docs/brand/')) continue;
            walkDocsFiles(root, full, out);
            continue;
        }
        if (!ent.isFile()) continue;
        let st;
        try {
            st = statSync(full);
        } catch {
            continue;
        }
        out.push({
            rel,
            name: ent.name,
            module: rel.split('/')[1] || '',
            bytes: st.size,
            mtimeMs: st.mtimeMs,
            isLatest: isLatestArtifact(ent.name),
            managed: isManagedReportFile(ent.name)
        });
    }
}

export function listDocsFiles(root) {
    const docs = join(root, 'docs');
    const out = [];
    if (!existsSync(docs)) return out;
    walkDocsFiles(root, docs, out);
    out.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return out;
}

export function listManagedReports(root) {
    return listDocsFiles(root).filter((f) => f.managed);
}

export function getDocsStats(root) {
    const files = listDocsFiles(root);
    const bytes = files.reduce((s, f) => s + f.bytes, 0);
    const managed = files.filter((f) => f.managed);
    return {
        docsBytes: bytes,
        docsHuman: formatBytes(bytes),
        fileCount: files.length,
        reportCount: managed.length,
        moduleCount: new Set(managed.map((f) => f.module)).size
    };
}

export function formatBytes(n) {
    if (!Number.isFinite(n) || n < 0) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Usuń jeden plik raportu w docs/ (z potwierdzeniem po stronie UI/CLI).
 * @param {{ allowLatest?: boolean }} opts
 */
export function deleteReportFile(root, relPath, opts = {}) {
    const resolved = resolveSafeDocsPath(root, relPath);
    if (!resolved.ok) return { ok: false, reason: resolved.reason, deleted: [] };
    if (!existsSync(resolved.abs)) {
        return { ok: false, reason: 'plik nie istnieje', deleted: [] };
    }
    const st = statSync(resolved.abs);
    if (!st.isFile()) {
        return { ok: false, reason: 'tylko pliki (nie katalogi)', deleted: [] };
    }
    const name = basename(resolved.abs);
    if (shouldKeepDocFile(name)) {
        return { ok: false, reason: `chroniona dokumentacja: ${name}`, deleted: [] };
    }
    if (!isManagedReportFile(name)) {
        return { ok: false, reason: 'to nie jest zarządzany raport', deleted: [] };
    }
    if (isLatestArtifact(name) && opts.allowLatest === false) {
        return { ok: false, reason: 'latest.md / latest.json chronione (użyj allowLatest)', deleted: [] };
    }
    unlinkSync(resolved.abs);
    return { ok: true, deleted: [resolved.rel], reason: null };
}

/**
 * Usuń raporty starsze niż N dni — bez latest.md / latest.json.
 */
export function cleanupOlderThanDays(root, days = 30) {
    const cutoff = Date.now() - days * 86400000;
    const deleted = [];
    const skipped = [];
    for (const f of listManagedReports(root)) {
        if (!isAutoCleanupCandidate(f.name)) {
            skipped.push({ rel: f.rel, reason: 'latest lub chronione' });
            continue;
        }
        if (f.mtimeMs >= cutoff) continue;
        const r = deleteReportFile(root, f.rel, { allowLatest: false });
        if (r.ok) deleted.push(...r.deleted);
        else skipped.push({ rel: f.rel, reason: r.reason });
    }
    return { ok: true, deleted, skipped, mode: `older-than-${days}` };
}

/**
 * Pozostaw ostatnich `keep` raportów z każdego modułu — bez latest.md / latest.json.
 */
export function cleanupKeepLastPerModule(root, keep = 20) {
    const byModule = new Map();
    for (const f of listManagedReports(root)) {
        if (!isAutoCleanupCandidate(f.name)) continue;
        const m = f.module || '_root';
        if (!byModule.has(m)) byModule.set(m, []);
        byModule.get(m).push(f);
    }
    const deleted = [];
    const skipped = [];
    for (const [, files] of byModule) {
        files.sort((a, b) => b.mtimeMs - a.mtimeMs);
        const excess = files.slice(Math.max(0, keep));
        for (const f of excess) {
            const r = deleteReportFile(root, f.rel, { allowLatest: false });
            if (r.ok) deleted.push(...r.deleted);
            else skipped.push({ rel: f.rel, reason: r.reason });
        }
    }
    return { ok: true, deleted, skipped, mode: `keep-last-${keep}` };
}

export function readReportText(root, relPath) {
    const resolved = resolveSafeDocsPath(root, relPath);
    if (!resolved.ok) return { ok: false, reason: resolved.reason, text: '' };
    if (!existsSync(resolved.abs)) return { ok: false, reason: 'brak pliku', text: '' };
    return { ok: true, text: readFileSync(resolved.abs, 'utf8'), rel: resolved.rel };
}

export function buildReportsIndex(root) {
    const stats = getDocsStats(root);
    const reports = listManagedReports(root).map((f) => ({
        rel: f.rel,
        module: f.module,
        name: f.name,
        bytes: f.bytes,
        human: formatBytes(f.bytes),
        mtime: new Date(f.mtimeMs).toISOString(),
        isLatest: f.isLatest
    }));
    return {
        generatedAt: new Date().toISOString(),
        policy: { autoApply: false, autoFix: false, docsOnly: true },
        stats,
        reports
    };
}

export function writeReportsIndex(root) {
    const index = buildReportsIndex(root);
    const dir = join(root, 'docs', 'dev-center');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const jsonPath = join(dir, 'reports-index.json');
    writeFileSync(jsonPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
    return { path: 'docs/dev-center/reports-index.json', index };
}

export function preferredCopyPath(moduleKey) {
    const map = {
        guardian: 'docs/guardian-future/latest.md',
        dream: 'docs/dream/latest.md',
        brain: 'docs/product-brain/latest.md',
        health: 'docs/health/latest.md',
        brand: 'docs/brand-protection/latest.md',
        intelligence: 'docs/intelligence/latest.md',
        livingRegion: 'docs/living-region/latest.md',
        productIntel: 'docs/product-intelligence/latest.md',
        trust: 'docs/trust/latest.md',
        reflect: 'docs/self-reflection/latest.md'
    };
    return map[moduleKey] || null;
}

export function preferredJsonPath(moduleKey) {
    const md = preferredCopyPath(moduleKey);
    if (!md) return null;
    return md.replace(/\.md$/i, '.json');
}
