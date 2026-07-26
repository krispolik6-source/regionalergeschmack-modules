// js/map/mapSettingsPanel.js – panel ustawień mapy

import { t } from '../core/i18n.js';
import {
    MAP_CATEGORIES,
    MAP_STYLE_OPTIONS,
    getMapSettings,
    setRuntimeMapSettings,
    saveMapSettings,
    resetMapSettings
} from './mapSettings.js?v=2';
import { getCategoryIcon } from '../presentation/categoryIcons.js';

let escapePanelContainer = null;
let escapeListenerBound = false;

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getCategoryLabel(category) {
    const key = `producer.types.${category}`;
    const label = t(key);
    return label !== key ? label : category;
}

function getStyleLabel(styleId) {
    const key = `map.style.${styleId}`;
    const label = t(key);
    return label !== key ? label : styleId;
}

function readPanelSettings(root) {
    const settings = getMapSettings();
    const markerColors = { ...settings.markerColors };
    const categoryVisibility = { ...settings.categoryVisibility };

    root.querySelectorAll('[data-map-color]').forEach((input) => {
        const cat = input.dataset.mapColor;
        if (cat) markerColors[cat] = input.value;
    });

    root.querySelectorAll('[data-map-category-toggle]').forEach((input) => {
        const cat = input.dataset.mapCategoryToggle;
        if (cat) categoryVisibility[cat] = input.checked;
    });

    const styleInput = root.querySelector('input[name="mapStyle"]:checked');
    const mapStyle = styleInput?.value || settings.mapStyle;

    return { markerColors, categoryVisibility, mapStyle };
}

function buildCategoryRows(settings) {
    return MAP_CATEGORIES.map((category) => {
        const color = settings.markerColors[category];
        const visible = settings.categoryVisibility[category] !== false;
        const icon = getCategoryIcon(category);
        const label = escapeHtml(getCategoryLabel(category));

        return `
            <div class="map-settings-category-row">
                <label class="map-settings-category-toggle">
                    <input type="checkbox" data-map-category-toggle="${category}" ${visible ? 'checked' : ''}>
                    <span class="map-settings-category-icon" aria-hidden="true">${icon}</span>
                    <span>${label}</span>
                </label>
                <input type="color" class="map-settings-color-input" data-map-color="${category}" value="${escapeHtml(color)}" aria-label="${label}">
            </div>
        `;
    }).join('');
}

function buildStyleOptions(settings) {
    return Object.keys(MAP_STYLE_OPTIONS).map((styleId) => `
        <label class="map-settings-style-option">
            <input type="radio" name="mapStyle" value="${styleId}" ${settings.mapStyle === styleId ? 'checked' : ''}>
            <span>${escapeHtml(getStyleLabel(styleId))}</span>
        </label>
    `).join('');
}

export function ensureMapSettingsPanel(container) {
    if (!container || container.querySelector('#mapSettingsPanel')) return;

    const settings = getMapSettings();

    container.insertAdjacentHTML('beforeend', `
        <div id="mapSettingsPanel" class="map-settings-panel" hidden aria-hidden="true">
            <div class="map-settings-backdrop" data-map-settings-close></div>
            <div class="map-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="mapSettingsTitle">
                <header class="map-settings-header">
                    <h3 id="mapSettingsTitle">⚙️ ${escapeHtml(t('map.edit'))}</h3>
                    <button type="button" class="map-settings-close" data-map-settings-close aria-label="${escapeHtml(t('btn.close'))}">×</button>
                </header>
                <div class="map-settings-body">
                    <section class="map-settings-section">
                        <h4 class="map-settings-section-title">${escapeHtml(t('map.styleTitle'))}</h4>
                        <div class="map-settings-style-grid">${buildStyleOptions(settings)}</div>
                    </section>
                    <section class="map-settings-section">
                        <h4 class="map-settings-section-title">${escapeHtml(t('map.categoriesTitle'))}</h4>
                        <div class="map-settings-categories">${buildCategoryRows(settings)}</div>
                    </section>
                </div>
                <footer class="map-settings-footer">
                    <button type="button" class="map-settings-btn map-settings-btn-reset" data-map-settings-reset>${escapeHtml(t('map.reset'))}</button>
                    <button type="button" class="map-settings-btn map-settings-btn-save" data-map-settings-save>${escapeHtml(t('map.save'))}</button>
                </footer>
            </div>
        </div>
    `);
}

export function bindMapSettingsPanel(container, { onApply }) {
    const panel = container?.querySelector('#mapSettingsPanel');
    if (!panel || panel.dataset.bound === 'true') return;
    panel.dataset.bound = 'true';

    const applyFromPanel = () => {
        const next = readPanelSettings(panel);
        setRuntimeMapSettings(next);
        onApply?.(next);
    };

    panel.addEventListener('change', (event) => {
        if (event.target.closest('#mapSettingsPanel')) {
            applyFromPanel();
        }
    });

    panel.addEventListener('input', (event) => {
        if (event.target.matches('[data-map-color]')) {
            applyFromPanel();
        }
    });

    panel.addEventListener('click', (event) => {
        if (event.target.closest('[data-map-settings-close]')) {
            closeMapSettingsPanel(container);
            return;
        }

        if (event.target.closest('[data-map-settings-save]')) {
            const next = readPanelSettings(panel);
            saveMapSettings(next);
            onApply?.(next);
            closeMapSettingsPanel(container);
            return;
        }

        if (event.target.closest('[data-map-settings-reset]')) {
            const defaults = resetMapSettings();
            refreshMapSettingsPanel(container);
            onApply?.(defaults);
        }
    });

    if (!escapeListenerBound) {
        escapeListenerBound = true;
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            const panelEl = escapePanelContainer?.querySelector('#mapSettingsPanel');
            if (panelEl && !panelEl.hidden) {
                closeMapSettingsPanel(escapePanelContainer);
            }
        });
    }
}

export function refreshMapSettingsPanel(container) {
    const panel = container?.querySelector('#mapSettingsPanel');
    if (!panel) return;

    const settings = getMapSettings();
    const categoriesEl = panel.querySelector('.map-settings-categories');
    const stylesEl = panel.querySelector('.map-settings-style-grid');

    if (categoriesEl) categoriesEl.innerHTML = buildCategoryRows(settings);
    if (stylesEl) stylesEl.innerHTML = buildStyleOptions(settings);
}

export function openMapSettingsPanel(container) {
    const panel = container?.querySelector('#mapSettingsPanel');
    if (!panel) return;

    refreshMapSettingsPanel(container);
    escapePanelContainer = container;
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('map-settings-open');
    panel.querySelector('.map-settings-close')?.focus();
}

export function closeMapSettingsPanel(container) {
    const panel = container?.querySelector('#mapSettingsPanel');
    if (!panel || panel.hidden) return;

    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('map-settings-open');
    if (escapePanelContainer === container) escapePanelContainer = null;
    container.querySelector('#mapGpsBtn')?.focus();
}

export default {
    ensureMapSettingsPanel,
    bindMapSettingsPanel,
    refreshMapSettingsPanel,
    openMapSettingsPanel,
    closeMapSettingsPanel
};
