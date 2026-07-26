#!/usr/bin/env node
/**
 * ETAP 34C — lokalne API Report Manager (tylko 127.0.0.1)
 * npm run report-manager:api
 *
 * GET  /status
 * GET  /index
 * GET  /stats
 * GET  /file?path=docs/...
 * POST /delete   { path, allowLatest?, confirm: true }
 * POST /cleanup  { mode: 'older-30'|'keep-20', confirm: true }
 * POST /refresh  → przebuduj reports-index.json
 */
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    buildReportsIndex,
    writeReportsIndex,
    getDocsStats,
    deleteReportFile,
    cleanupOlderThanDays,
    cleanupKeepLastPerModule,
    readReportText,
    resolveSafeDocsPath
} from './lib/report-manager-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.RG_REPORT_API_PORT || 3457);
const HOST = '127.0.0.1';

function send(res, status, body, type = 'application/json; charset=utf-8') {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': type,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store'
    });
    res.end(data);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
    if (req.method === 'OPTIONS') {
        send(res, 204, '');
        return;
    }

    try {
        if (req.method === 'GET' && url.pathname === '/status') {
            send(res, 200, { ok: true, host: HOST, port: PORT, root: 'docs-only' });
            return;
        }
        if (req.method === 'GET' && url.pathname === '/stats') {
            send(res, 200, { ok: true, ...getDocsStats(ROOT) });
            return;
        }
        if (req.method === 'GET' && url.pathname === '/index') {
            send(res, 200, buildReportsIndex(ROOT));
            return;
        }
        if (req.method === 'GET' && url.pathname === '/file') {
            const p = url.searchParams.get('path') || '';
            const r = readReportText(ROOT, p);
            if (!r.ok) {
                send(res, 400, { ok: false, reason: r.reason });
                return;
            }
            send(res, 200, r.text, 'text/plain; charset=utf-8');
            return;
        }
        if (req.method === 'POST' && url.pathname === '/refresh') {
            const { path, index } = writeReportsIndex(ROOT);
            send(res, 200, { ok: true, path, stats: index.stats, reports: index.reports });
            return;
        }
        if (req.method === 'POST' && url.pathname === '/delete') {
            const body = await readBody(req);
            if (body.confirm !== true) {
                send(res, 400, { ok: false, reason: 'wymagane confirm:true' });
                return;
            }
            const safe = resolveSafeDocsPath(ROOT, body.path || '');
            if (!safe.ok) {
                send(res, 400, { ok: false, reason: safe.reason });
                return;
            }
            const r = deleteReportFile(ROOT, body.path, {
                allowLatest: body.allowLatest !== false
            });
            if (r.ok) writeReportsIndex(ROOT);
            send(res, r.ok ? 200 : 400, r);
            return;
        }
        if (req.method === 'POST' && url.pathname === '/cleanup') {
            const body = await readBody(req);
            if (body.confirm !== true) {
                send(res, 400, { ok: false, reason: 'wymagane confirm:true' });
                return;
            }
            const mode = body.mode || 'older-30';
            const r = mode === 'keep-20' || mode === 'keep-last-20'
                ? cleanupKeepLastPerModule(ROOT, 20)
                : cleanupOlderThanDays(ROOT, 30);
            writeReportsIndex(ROOT);
            send(res, 200, {
                ok: true,
                mode: r.mode,
                deletedCount: r.deleted.length,
                deleted: r.deleted,
                skippedCount: r.skipped.length
            });
            return;
        }
        send(res, 404, { ok: false, reason: 'not found' });
    } catch (e) {
        send(res, 500, { ok: false, reason: String(e?.message || e) });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`[report-manager:api] http://${HOST}:${PORT}`);
    console.log('docs/ only · never js/css/assets/index/manifest/sw/package.json');
});
