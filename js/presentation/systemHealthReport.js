/**
 * UI raportu System Health — dyskretna lista w menu ☰ (bez wrażenia „AI”).
 */

import { t } from '../core/i18n.js';
import {
    getHealingReport,
    getLatestSystemHealthMarkdown,
    HEALING_STATUS_META
} from '../core/selfHealingLogger.js';

function th(key) {
    const value = t(`systemHealth.${key}`);
    return value === `systemHealth.${key}` ? key : value;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTime(iso) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(iso));
    } catch {
        return String(iso || '').slice(11, 16);
    }
}

function statusLabel(status) {
    if (status === 'FIXED') return th('statusFixed');
    if (status === 'SUGGESTION') return th('statusSuggestion');
    return th('statusFailed');
}

function buildEntryHtml(entry) {
    const meta = HEALING_STATUS_META[entry.status] || HEALING_STATUS_META.FAILED;
    return `
        <li class="healing-report-item ${meta.cssClass}">
            <div class="healing-report-item-head">
                <span class="healing-report-badge" aria-hidden="true">${meta.emoji}</span>
                <span class="healing-report-status">${escapeHtml(statusLabel(entry.status))}</span>
                <time class="healing-report-time" datetime="${escapeHtml(entry.timestamp)}">${escapeHtml(formatTime(entry.timestamp))}</time>
            </div>
            <p class="healing-report-component">${escapeHtml(entry.component)}</p>
            <p class="healing-report-desc">${escapeHtml(entry.description)}</p>
        </li>
    `;
}

function buildCountsLine(entries) {
    const fixed = entries.filter((e) => e.status === 'FIXED').length;
    const suggestion = entries.filter((e) => e.status === 'SUGGESTION').length;
    const failed = entries.filter((e) => e.status === 'FAILED').length;
    return th('counts')
        .replace('{fixed}', String(fixed))
        .replace('{suggestion}', String(suggestion))
        .replace('{failed}', String(failed));
}

/**
 * @param {HTMLElement | null} root
 */
export function renderSystemHealthPanel(root) {
    if (!root) return;

    const report = getHealingReport();
    const entries = [...(report.entries || [])].reverse().slice(0, 40);
    const summary = getLatestSystemHealthMarkdown();

    root.innerHTML = `
        <h3 class="side-menu-detail-title">${escapeHtml(th('title'))}</h3>
        <p class="side-menu-detail-lead">${escapeHtml(th('lead'))}</p>
        <p class="healing-report-counts" role="status">${escapeHtml(buildCountsLine(report.entries || []))}</p>
        ${entries.length
        ? `<ul class="healing-report-list" role="list">${entries.map(buildEntryHtml).join('')}</ul>`
        : `<p class="side-menu-detail-note">${escapeHtml(th('empty'))}</p>`}
        ${summary
        ? `<details class="healing-report-summary">
                <summary>${escapeHtml(th('summaryTitle'))}</summary>
                <pre class="healing-report-markdown">${escapeHtml(summary.slice(0, 4000))}</pre>
           </details>`
        : ''}
    `;
}

export default { renderSystemHealthPanel };
