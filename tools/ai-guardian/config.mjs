// tools/ai-guardian/config.mjs – konfiguracja lokalnego AI Guardian (dev-only)
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const GUARDIAN_ROOT = __dirname;
export const PROJECT_ROOT = path.resolve(__dirname, '../..');
export const REPORTS_DIR = path.join(GUARDIAN_ROOT, 'reports');
export const DATA_DIR = path.join(GUARDIAN_ROOT, 'data');
export const LEARNING_FILE = path.join(DATA_DIR, 'learning.json');
export const BEHAVIOR_FILE = path.join(DATA_DIR, 'behavior-stats.json');

/** Katalogi skanowane (bez node_modules / legacy bundle). */
export const SCAN_GLOBS = Object.freeze({
    js: ['js/**/*.js'],
    css: ['css/**/*.css'],
    html: ['*.html', 'legal/**/*.html'],
    assets: ['assets/**/*.{webp,jpg,jpeg,png,svg,json}'],
    ignore: [
        '**/node_modules/**',
        '**/legacy/app.bundle.js',
        '**/tools/ai-guardian/reports/**',
        '**/tools/ai-guardian/data/**'
    ]
});

export const SEVERITY = Object.freeze({
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    cosmetic: 'cosmetic'
});

export const MODULES = Object.freeze([
    'code',
    'ux',
    'behavior',
    'content',
    'performance',
    'improvement',
    'learning'
]);

/** Guardian NIGDY nie zapisuje kodu aplikacji – tylko raporty. */
export const POLICY = Object.freeze({
    autoModifyCode: false,
    autoCommit: false,
    autoPublish: false,
    autoApplyPatch: false,
    affectProductionUsers: false
});
