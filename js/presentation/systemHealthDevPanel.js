/**
 * System Health — widok deweloperski (Developer Vault · PIN).
 * Scalone: healingReport · selfHealingLog · logs/system_health_*.md
 */

import { t } from '../core/i18n.js';
import { isDevVaultUnlocked } from '../diagnostics/devVault.js';
import {
    buildUnifiedSystemHealth,
    HEALING_STATUS_META
} from '../core/selfHealingLogger.js';

const STYLE_ID = 'rg-system-health-dev-style';

function th(key, fallback = key) {
    const value = t(`systemHealth.${key}`);
    return value === `systemHealth.${key}` ? fallback : value;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDateTime(iso) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(iso));
    } catch {
        return String(iso || '');
    }
}

function statusLabel(status) {
    if (status === 'FIXED') return th('statusFixed', 'Fixed');
    if (status === 'SUGGESTION') return th('statusSuggestion', 'Suggestion');
    return th('statusFailed', 'Failed');
}

function sourceLabel(source) {
    if (source === 'healingReport') return th('sourceReport', 'healingReport');
    if (source === 'selfHealingLog') return th('sourceLog', 'selfHealingLog');
    if (source === 'markdown') return th('sourceMarkdown', 'system_health.md');
    return String(source || '—');
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.rg-sh-dev { font-family: 'Source Sans 3', system-ui, sans-serif; color: #1c1812; }
.rg-sh-dev-head { margin: 0 0 12px; }
.rg-sh-dev-head h3 { margin: 0 0 6px; font-family: Literata, Georgia, serif; font-size: 1.15rem; color: #2a3f28; }
.rg-sh-dev-head p { margin: 0; font-size: .88rem; color: #4a3f32; line-height: 1.45; }
.rg-sh-dev-counts { margin: 10px 0 12px; font-size: .84rem; color: #4a3f32; }
.rg-sh-dev-sources { margin: 0 0 12px; font-size: .78rem; color: #5c5348; }
.rg-sh-table-wrap { overflow: auto; max-height: min(52vh, 480px); border: 1px solid rgba(42,63,40,.14); border-radius: 12px; background: #fffef8; }
.rg-sh-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
.rg-sh-table th { position: sticky; top: 0; z-index: 1; text-align: left; padding: 8px 10px; background: #eef3ea; color: #2a3f28; font-weight: 700; border-bottom: 1px solid rgba(42,63,40,.12); white-space: nowrap; }
.rg-sh-table td { padding: 8px 10px; border-bottom: 1px solid rgba(42,63,40,.08); vertical-align: top; }
.rg-sh-row { cursor: pointer; transition: background .15s ease; }
.rg-sh-row:hover { background: rgba(42,63,40,.04); }
.rg-sh-row.is-open { background: rgba(201,162,39,.08); }
.rg-sh-row.healing-status--fixed td:first-child { border-left: 4px solid #2a3f28; }
.rg-sh-row.healing-status--suggestion td:first-child { border-left: 4px solid #c9a227; }
.rg-sh-row.healing-status--failed td:first-child { border-left: 4px solid #9e3b3b; }
.rg-sh-status { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; white-space: nowrap; }
.rg-sh-component { font-family: ui-monospace, 'Cascadia Code', monospace; font-size: .78rem; word-break: break-word; }
.rg-sh-desc { max-width: 220px; word-break: break-word; color: #4a3f32; }
.rg-sh-time { white-space: nowrap; font-size: .76rem; color: #5c5348; }
.rg-sh-source { font-size: .74rem; color: #5c5348; white-space: nowrap; }
.rg-sh-detail-row td { padding: 0; background: rgba(42,63,40,.03); border-bottom: 1px solid rgba(42,63,40,.1); }
.rg-sh-detail { padding: 10px 12px 12px; font-size: .8rem; line-height: 1.45; color: #2a3f28; }
.rg-sh-detail dl { margin: 0; display: grid; gap: 6px; }
.rg-sh-detail dt { font-weight: 700; color: #4a3f32; }
.rg-sh-detail dd { margin: 0 0 8px; word-break: break-word; }
.rg-sh-detail pre { margin: 8px 0 0; padding: 8px 10px; background: rgba(0,0,0,.04); border-radius: 8px; overflow: auto; max-height: 180px; font-size: .74rem; white-space: pre-wrap; }
.rg-sh-empty { padding: 16px; text-align: center; color: #5c5348; font-size: .9rem; }
.rg-sh-dev-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
`;
    document.head.appendChild(style);
}

function buildDetailHtml(entry) {
    const parts = [];
    parts.push(`<dl>`);
    parts.push(`<dt>${escapeHtml(th('colDescription', 'Description'))}</dt><dd>${escapeHtml(entry.description)}</dd>`);
    parts.push(`<dt>${escapeHtml(th('devTimestamp', 'Timestamp'))}</dt><dd><time datetime="${escapeHtml(entry.timestamp)}">${escapeHtml(formatDateTime(entry.timestamp))}</time></dd>`);
    parts.push(`<dt>${escapeHtml(th('devSource', 'Source'))}</dt><dd>${escapeHtml(sourceLabel(entry.source))}</dd>`);
    if (entry.relatedLogId) {
        parts.push(`<dt>relatedLogId</dt><dd><code>${escapeHtml(entry.relatedLogId)}</code></dd>`);
    }
    if (entry.markdownKey) {
        parts.push(`<dt>markdown</dt><dd><code>${escapeHtml(entry.markdownKey)}</code></dd>`);
    }
    if (entry.message) {
        parts.push(`<dt>message</dt><dd>${escapeHtml(entry.message)}</dd>`);
    }
    if (entry.mitigation) {
        parts.push(`<dt>mitigation</dt><dd><pre>${escapeHtml(JSON.stringify(entry.mitigation, null, 2))}</pre></dd>`);
    }
    if (entry.aiProposal) {
        parts.push(`<dt>aiProposal</dt><dd><pre>${escapeHtml(JSON.stringify(entry.aiProposal, null, 2))}</pre></dd>`);
    }
    if (entry.context) {
        parts.push(`<dt>context</dt><dd><pre>${escapeHtml(JSON.stringify(entry.context, null, 2))}</pre></dd>`);
    }
    if (entry.stack) {
        parts.push(`<dt>stack trace</dt><dd><pre>${escapeHtml(entry.stack)}</pre></dd>`);
    }
    parts.push(`</dl>`);
    return parts.join('');
}

function buildRowHtml(entry, index) {
    const meta = HEALING_STATUS_META[entry.status] || HEALING_STATUS_META.FAILED;
    const rowId = `rg-sh-row-${index}`;
    return `
        <tr class="rg-sh-row ${meta.cssClass}" data-sh-toggle="${rowId}" role="button" tabindex="0" aria-expanded="false" aria-controls="${rowId}-detail">
            <td><span class="rg-sh-status">${meta.emoji} ${escapeHtml(statusLabel(entry.status))}</span></td>
            <td class="rg-sh-component">${escapeHtml(entry.component)}</td>
            <td class="rg-sh-desc">${escapeHtml(entry.description)}</td>
            <td class="rg-sh-time"><time datetime="${escapeHtml(entry.timestamp)}">${escapeHtml(formatDateTime(entry.timestamp))}</time></td>
            <td class="rg-sh-source">${escapeHtml(sourceLabel(entry.source))}</td>
        </tr>
        <tr class="rg-sh-detail-row" id="${rowId}-detail" hidden>
            <td colspan="5"><div class="rg-sh-detail">${buildDetailHtml(entry)}</div></td>
        </tr>
    `;
}

function bindRowToggles(root) {
    const toggleRow = (trigger) => {
        const rowId = trigger.getAttribute('data-sh-toggle');
        const detail = root.querySelector(`#${rowId}-detail`);
        if (!detail) return;
        const open = detail.hidden;
        detail.hidden = !open;
        trigger.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    root.querySelectorAll('[data-sh-toggle]').forEach((row) => {
        row.addEventListener('click', () => toggleRow(row));
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleRow(row);
            }
        });
    });
}

function buildCountsLine(counts) {
    return th('counts', '{fixed} fixed · {suggestion} hints · {failed} open')
        .replace('{fixed}', String(counts.fixed))
        .replace('{suggestion}', String(counts.suggestion))
        .replace('{failed}', String(counts.failed));
}

function buildSourcesLine(sources) {
    return th('devSources', 'healingReport {report} · log {log} · markdown {md}')
        .replace('{report}', String(sources.healingReport))
        .replace('{log}', String(sources.selfHealingLog))
        .replace('{md}', String(sources.markdown));
}

/**
 * @param {HTMLElement | null} root
 * @returns {boolean}
 */
export function renderSystemHealthDevPanel(root) {
    if (!root) return false;

    if (!isDevVaultUnlocked()) {
        root.innerHTML = `<p class="rg-sh-empty">${escapeHtml(th('devLocked', 'Dostęp tylko po odblokowaniu panelu deweloperskiego (PIN).'))}</p>`;
        return false;
    }

    ensureStyles();
    const unified = buildUnifiedSystemHealth();
    const { entries, counts, sources, sessionId, generatedAt } = unified;

    root.innerHTML = `
        <div class="rg-sh-dev">
            <header class="rg-sh-dev-head">
                <h3>${escapeHtml(th('devTitle', 'System Health'))}</h3>
                <p>${escapeHtml(th('devLead', 'Scalone logi: healingReport · selfHealingLog · logs/system_health_*.md'))}</p>
            </header>
            <p class="rg-sh-dev-counts" role="status">${escapeHtml(buildCountsLine(counts))} · ${escapeHtml(th('devTotal', 'Łącznie'))}: ${entries.length}</p>
            <p class="rg-sh-dev-sources">${escapeHtml(buildSourcesLine(sources))} · session <code>${escapeHtml(sessionId)}</code></p>
            ${entries.length
        ? `<div class="rg-sh-table-wrap">
                <table class="rg-sh-table">
                    <thead>
                        <tr>
                            <th scope="col">${escapeHtml(th('colStatus', 'Status'))}</th>
                            <th scope="col">${escapeHtml(th('colComponent', 'Component'))}</th>
                            <th scope="col">${escapeHtml(th('colDescription', 'Description'))}</th>
                            <th scope="col">${escapeHtml(th('colTime', 'Time'))}</th>
                            <th scope="col">${escapeHtml(th('devSource', 'Source'))}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map((entry, index) => buildRowHtml(entry, index)).join('')}
                    </tbody>
                </table>
           </div>`
        : `<p class="rg-sh-empty">${escapeHtml(th('empty', 'No entries'))}</p>`}
            <div class="rg-sh-dev-actions">
                <button type="button" class="rg-dv-secondary" data-sh-refresh>${escapeHtml(th('devRefresh', 'Odśwież'))}</button>
            </div>
            <p class="rg-sh-dev-sources" style="margin-top:10px">${escapeHtml(th('devUpdated', 'Zaktualizowano'))}: ${escapeHtml(formatDateTime(generatedAt))}</p>
        </div>
    `;

    root.querySelector('[data-sh-refresh]')?.addEventListener('click', () => {
        renderSystemHealthDevPanel(root);
    });
    bindRowToggles(root);
    return true;
}

export default { renderSystemHealthDevPanel };
