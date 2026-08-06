/**
 * Self-Healing – codzienny health check (CLI) + opcjonalny e-mail.
 *
 * Usage:
 *   node scripts/self-healing-daily.mjs
 *   node scripts/self-healing-daily.mjs --send
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    OWNER_DEVELOPER_EMAIL,
    DEFAULT_SMTP_FROM_WEEKLY,
    selfHealMailSubject,
    resolveMailConfig,
    sendDeveloperMail
} from './lib/developer-smtp.mjs';
import { readDiagnosticsWiring } from './lib/diagnosticsOrchestratorAssert.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'self-heal');
const wantSend = process.argv.includes('--send');

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function loadEnvFile() {
    const envPath = join(ROOT, '.env');
    if (!existsSync(envPath)) return {};
    const out = {};
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i < 1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1);
        }
        out[k] = v;
    }
    return out;
}

const day = dayStamp();
const { spawnSync } = await import('node:child_process');

async function main() {
    const result = { day, issues: [], fixes: [], qqLeft: 0 };

    const indexPath = join(ROOT, 'index.html');
    let html = readFileSync(indexPath, 'utf8');
    result.qqLeft = (html.match(/\?\?/g) || []).length;

    if (result.qqLeft > 0 && existsSync(join(ROOT, 'scripts/fix-menu-and-modal.mjs'))) {
        const r = spawnSync(process.execPath, [join(ROOT, 'scripts/fix-menu-and-modal.mjs')], {
            cwd: ROOT,
            encoding: 'utf8'
        });
        if (r.status === 0) {
            result.fixes.push('naprawiono znaki ?? / ikony w index.html');
            html = readFileSync(indexPath, 'utf8');
            result.qqLeft = (html.match(/\?\?/g) || []).length;
        } else {
            result.issues.push('nie udało się naprawić index.html UTF-8');
        }
    } else if (result.qqLeft === 0) {
        result.fixes.push('index.html bez ??');
    }

    if (!html.includes('\u2630')) result.issues.push('brak ☰ w menu');
    else result.fixes.push('ikona menu ☰ OK');

    const catImg = readFileSync(join(ROOT, 'js/presentation/categoryImages.js'), 'utf8');
    if (catImg.includes("shop: `${BASE}/category_shops.webp")) {
        result.fixes.push('mapowanie sklepów → category_shops');
    } else {
        result.issues.push('mapowanie sklepów uszkodzone');
    }

    const mood = readFileSync(join(ROOT, 'js/presentation/producerMood.js'), 'utf8');
    const shopIdx = mood.indexOf("key === 'shop'");
    const honeyIdx = mood.indexOf('honey|honig');
    if (shopIdx >= 0 && (honeyIdx < 0 || shopIdx < honeyIdx)) {
        result.fixes.push('mood: sklep nie dziedziczy pasieki');
    } else {
        result.issues.push('mood: ryzyko honey dla sklepów');
    }

    if (existsSync(join(ROOT, 'js/diagnostics/selfHealing.js'))) {
        result.fixes.push('moduł selfHealing.js obecny');
    } else {
        result.issues.push('brak selfHealing.js');
    }

    const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
    const token = style.match(/--photo-modal-height:\s*([^;]+)/)?.[1]?.trim();
    if (token === '160px') result.fixes.push('modal photo 160px');
    else result.issues.push(`modal photo token: ${token}`);

    const { orch } = readDiagnosticsWiring(ROOT);
    if (orch.includes('selfHealing.initSelfHealing')) result.fixes.push('selfHealing lazy w orchestratorze');
    else result.issues.push('brak selfHealing w orchestratorze');

    mkdirSync(OUT_DIR, { recursive: true });
    const jsonPath = join(OUT_DIR, `self-heal-${day}.json`);
    const latestPath = join(OUT_DIR, 'latest.json');
    writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
    writeFileSync(latestPath, JSON.stringify(result, null, 2), 'utf8');

    const body = [
        `Auto-naprawa – Regionaler Smak ${day}`,
        '',
        `Odbiorca: ${OWNER_DEVELOPER_EMAIL}`,
        '',
        '## Naprawy / OK',
        ...(result.fixes.length ? result.fixes.map((f) => `• ${f}`) : ['• (brak)']),
        '',
        '## Problemy pozostałe',
        ...(result.issues.length ? result.issues.map((f) => `• ${f}`) : ['• brak']),
        '',
        '## Runtime',
        'W przeglądarce: __RG_SELF_HEAL__.run() oraz log: __RG_SELF_HEAL__.log()',
        '',
        'Polityka: tylko zdjęcia / ikony / układ · Brand Lock · bez Store/EventBus/API/GPS/Leaflet'
    ].join('\n');

    const mdPath = join(OUT_DIR, 'latest.md');
    writeFileSync(mdPath, body, 'utf8');
    console.log(body);
    console.log('\nZapisano', latestPath);

    if (!wantSend) {
        console.log('\n(Pominięto SMTP – dodaj --send aby wysłać)');
        return;
    }

    const env = { ...loadEnvFile(), ...process.env };
    if (env.NODE_ENV === 'production' || env.RG_PRODUCTION === '1') {
        console.warn('Produkcja – brak wysyłki Self-Heal mail');
        return;
    }

    const sendEnv = {
        ...env,
        DEVELOPER_MAIL_SEND: '1',
        SMTP_FROM: env.SMTP_FROM || DEFAULT_SMTP_FROM_WEEKLY
    };
    const cfg = resolveMailConfig(sendEnv);
    const subject = selfHealMailSubject(day);
    const sent = await sendDeveloperMail({ subject, text: body }, sendEnv);

    if (sent?.ok) {
        console.log('Wysłano:', subject, '→', cfg.to || OWNER_DEVELOPER_EMAIL);
    } else {
        console.warn('SMTP nie wysłano:', sent?.reason || sent?.error || 'brak konfiguracji');
    }
}

await main();
