/**
 * Usuwanie wygenerowanych raportów po wysyłce e-mail.
 *
 * NIE usuwa:
 *  - docs/instrukcja-instalacji.pdf
 *  - downloads/ (katalog główny projektu)
 *  - docs/brand/** (Brand Lock / Brand Book)
 *  - plików README.md / DEVELOPER-MAIL.md / stałej dokumentacji
 */

import {
    existsSync,
    readdirSync,
    rmSync,
    statSync,
    unlinkSync
} from 'node:fs';
import { join, basename } from 'node:path';

/** Foldery z generowanymi raportami (latest / datowane). */
export const REPORT_ARTIFACT_DIRS = [
    'docs/daily',
    'docs/health',
    'docs/improvements',
    'docs/virtual-user',
    'docs/advisor',
    'docs/quality-loop',
    'docs/emotion',
    'docs/living-brand',
    'docs/product-director',
    'docs/product-brain',
    'docs/self-reflection',
    'docs/guardian-future',
    'docs/dream',
    'docs/regional-intelligence',
    'docs/real-users',
    'docs/premium-weekly',
    'docs/brand-protection',
    'docs/logging',
    'docs/premium',
    'tools/ai-guardian/reports'
];

const KEEP_NAME = new Set([
    'readme.md',
    'developer-mail.md',
    'instrukcja-instalacji.pdf',
    '.gitkeep'
]);

const KEEP_PREFIX = ['brand-book', 'brand-lock', 'etap-20a'];

function shouldKeepFile(name) {
    const lower = name.toLowerCase();
    if (KEEP_NAME.has(lower)) return true;
    if (KEEP_PREFIX.some((p) => lower.startsWith(p))) return true;
    // stała dokumentacja w docs/premium (nie sam audit latest)
    if (lower === 'prelaunch-audit.md' || lower === 'prepublish-5-fixes.md') return true;
    return false;
}

function isGeneratedReportFile(name) {
    const lower = name.toLowerCase();
    if (shouldKeepFile(name)) return false;
    if (/^latest\./i.test(name)) return true;
    if (/^\d{4}-\d{2}-\d{2}/.test(name)) return true;
    if (/^\d{4}-w\d{2}/i.test(name)) return true;
    if (/^health-\d{4}/i.test(name)) return true;
    if (/\.(email|mailto)\.txt$/i.test(name)) return true;
    if (/^(production-|brand-protection|brand-consistency|visual-brand|master-icon|header-audit|logo-audit|responsive-premium|premium-audit)/i.test(lower)) {
        return true;
    }
    if (/\.(json|md|html|txt)$/i.test(name) && !shouldKeepFile(name)) {
        // w folderach raportowych – większość to artefakty
        return true;
    }
    return false;
}

/**
 * @param {string} root
 * @returns {{ deleted: string[], kept: string[], skippedDirs: string[] }}
 */
export function cleanReportArtifacts(root) {
    const deleted = [];
    const kept = [];
    const skippedDirs = [];

    // Bezwzględna ochrona Brand Book
    const brandDir = join(root, 'docs', 'brand');
    if (existsSync(brandDir)) skippedDirs.push('docs/brand (Brand Lock – nie ruszamy)');

    const pdf = join(root, 'docs', 'instrukcja-instalacji.pdf');
    if (existsSync(pdf)) kept.push('docs/instrukcja-instalacji.pdf');

    const downloads = join(root, 'downloads');
    if (existsSync(downloads)) skippedDirs.push('downloads/ (zachowane)');

    for (const rel of REPORT_ARTIFACT_DIRS) {
        const dir = join(root, rel);
        if (!existsSync(dir)) continue;
        let entries;
        try {
            entries = readdirSync(dir);
        } catch {
            continue;
        }
        for (const name of entries) {
            const full = join(dir, name);
            let st;
            try {
                st = statSync(full);
            } catch {
                continue;
            }
            if (st.isDirectory()) {
                // np. podszybki – usuń tylko jeśli wyglądają na artefakt
                if (/^\d{4}/.test(name) || name === 'archive') {
                    rmSync(full, { recursive: true, force: true });
                    deleted.push(`${rel}/${name}/`);
                }
                continue;
            }
            if (isGeneratedReportFile(name)) {
                unlinkSync(full);
                deleted.push(`${rel}/${name}`);
            } else {
                kept.push(`${rel}/${name}`);
            }
        }
    }

    // luźne raporty w docs/ root (nie brand)
    const docsRoot = join(root, 'docs');
    if (existsSync(docsRoot)) {
        for (const name of readdirSync(docsRoot)) {
            const full = join(docsRoot, name);
            let st;
            try {
                st = statSync(full);
            } catch {
                continue;
            }
            if (st.isDirectory()) continue;
            if (name.toLowerCase() === 'instrukcja-instalacji.pdf') {
                kept.push(`docs/${name}`);
                continue;
            }
            // nie usuwaj master/expert – to nie „generowany daily”
            if (/master-project-report|expert-product-review/i.test(name)) {
                kept.push(`docs/${name}`);
                continue;
            }
        }
    }

    return { deleted, kept, skippedDirs };
}
