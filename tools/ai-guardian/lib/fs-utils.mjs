import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT, SCAN_GLOBS } from '../config.mjs';

export function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

export function readText(relOrAbs) {
    const full = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(PROJECT_ROOT, relOrAbs);
    return fs.readFileSync(full, 'utf8');
}

export function exists(relOrAbs) {
    const full = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(PROJECT_ROOT, relOrAbs);
    return fs.existsSync(full);
}

export function walkFiles(relDir, extSet) {
    const root = path.join(PROJECT_ROOT, relDir);
    const out = [];
    if (!fs.existsSync(root)) return out;

    const stack = [root];
    while (stack.length) {
        const dir = stack.pop();
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            continue;
        }
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            const rel = path.relative(PROJECT_ROOT, full).replace(/\\/g, '/');
            if (SCAN_GLOBS.ignore.some((g) => matchIgnore(rel, g))) continue;
            if (ent.isDirectory()) {
                if (ent.name === 'node_modules' || ent.name === '.git') continue;
                stack.push(full);
            } else if (!extSet || extSet.has(path.extname(ent.name).toLowerCase())) {
                out.push(rel);
            }
        }
    }
    return out.sort();
}

function matchIgnore(rel, pattern) {
    // proste ** / * dopasowanie
    const re = new RegExp(
        `^${pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*\*/g, '::DOUBLE::')
            .replace(/\*/g, '[^/]*')
            .replace(/::DOUBLE::/g, '.*')}$`,
        'i'
    );
    return re.test(rel);
}

export function listJsFiles() {
    return walkFiles('js', new Set(['.js']));
}

export function listCssFiles() {
    return walkFiles('css', new Set(['.css']));
}

export function fileSize(rel) {
    try {
        return fs.statSync(path.join(PROJECT_ROOT, rel)).size;
    } catch {
        return 0;
    }
}

export function shaShort(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
}
