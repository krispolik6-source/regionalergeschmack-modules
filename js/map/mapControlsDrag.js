// js/map/mapControlsDrag.js – przeciąganie i skalowanie kontrolek mapy

const STORAGE_POSITIONS = 'map_icons_positions';
const STORAGE_SCALE = 'map_icons_scale';
const DRAG_THRESHOLD_PX = 8;
const SCALE_MIN = 0.75;
const SCALE_MAX = 1.45;

const DEFAULT_POSITIONS = Object.freeze({
    gps: { x: 2, y: 82 },
    osm: { x: 16, y: 82 },
    lista: { x: 32, y: 82 },
    legenda: { x: 68, y: 82 },
    suwak: { x: 2, y: 70 }
});

const DEFAULT_SCALES = Object.freeze({
    gps: 1,
    osm: 1,
    lista: 1,
    legenda: 1,
    suwak: 1
});

const CONTROL_SELECTORS = {
    gps: '#mapGpsBtn',
    osm: '#mapOsmBtn',
    lista: '#mapProducerList',
    legenda: '#mapLegendWrap',
    suwak: '#radiusControl'
};

let activeSession = null;

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return { ...fallback };
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : { ...fallback };
    } catch (_) {
        return { ...fallback };
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
        /* ignore quota */
    }
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function touchDistance(touches) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
}

function isInteractiveDragBlocker(target) {
    if (!target || !(target instanceof Element)) return false;
    if (target.closest('input[type="range"]')) return true;
    if (target.closest('.map-producer-list-items')) return true;
    if (target.closest('.map-legend-panel')) return true;
    return false;
}

function getPanelMetrics(panel) {
    const rect = panel.getBoundingClientRect();
    return { rect, width: rect.width || 1, height: rect.height || 1 };
}

function applyControlLayout(control, panel, positions, scales) {
    const id = control.dataset.mapControlId;
    if (!id) return;

    const pos = positions[id] || DEFAULT_POSITIONS[id];
    const scale = scales[id] ?? DEFAULT_SCALES[id] ?? 1;
    const { width, height } = getPanelMetrics(panel);

    const leftPx = (Number(pos.x) / 100) * width;
    const topPx = (Number(pos.y) / 100) * height;

    control.style.position = 'absolute';
    control.style.left = `${leftPx}px`;
    control.style.top = `${topPx}px`;
    control.style.right = 'auto';
    control.style.bottom = 'auto';
    control.style.margin = '0';
    control.style.transform = `scale(${scale})`;
    control.style.transformOrigin = 'top left';

    if (id === 'suwak') {
        const maxW = Math.max(160, width - leftPx - 8);
        control.style.width = `${Math.min(maxW, width * 0.96)}px`;
    } else if (id === 'lista') {
        const maxW = Math.max(120, width * 0.42);
        control.style.maxWidth = `${maxW}px`;
    }
}

function clampControlInPanel(control, panel) {
    const { rect, width, height } = getPanelMetrics(panel);
    const box = control.getBoundingClientRect();
    const currentLeft = box.left - rect.left;
    const currentTop = box.top - rect.top;

    const maxLeft = Math.max(0, width - box.width);
    const maxTop = Math.max(0, height - box.height);

    const left = clamp(currentLeft, 0, maxLeft);
    const top = clamp(currentTop, 0, maxTop);

    return {
        x: (left / width) * 100,
        y: (top / height) * 100
    };
}

function saveControlPosition(id, control, panel, positions) {
    const next = clampControlInPanel(control, panel);
    positions[id] = next;
    writeJson(STORAGE_POSITIONS, positions);
}

function saveControlScale(id, scale, scales) {
    scales[id] = clamp(scale, SCALE_MIN, SCALE_MAX);
    writeJson(STORAGE_SCALE, scales);
}

function getPointer(event) {
    if (event.touches?.length) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
}

/**
 * @param {HTMLElement} panel
 * @param {{ map?: import('leaflet').Map | null }} [options]
 */
export function initMapControlsDrag(panel, options = {}) {
    if (!panel) return () => {};

    const leafletMap = options.map || null;
    const positions = { ...DEFAULT_POSITIONS, ...readJson(STORAGE_POSITIONS, {}) };
    const scales = { ...DEFAULT_SCALES, ...readJson(STORAGE_SCALE, {}) };

    const controls = Object.entries(CONTROL_SELECTORS)
        .map(([id, selector]) => {
            const el = panel.querySelector(selector);
            if (!el) return null;
            el.dataset.mapControlId = id;
            el.classList.add('map-draggable-control');
            applyControlLayout(el, panel, positions, scales);
            return { id, el };
        })
        .filter(Boolean);

    const endSession = () => {
        if (!activeSession) return;
        const { control, panel: p, positions: pos, scales: sc, map, moved, id } = activeSession;

        control.classList.remove('is-dragging');
        document.body.classList.remove('map-control-drag-active');

        if (activeSession.mode === 'drag' && moved) {
            saveControlPosition(id, control, p, pos);
            control.dataset.dragSuppressed = 'true';
            setTimeout(() => {
                delete control.dataset.dragSuppressed;
            }, 0);
        }

        if (activeSession.mode === 'pinch') {
            saveControlScale(id, activeSession.currentScale, sc);
        }

        if (map?.dragging) {
            map.dragging.enable();
        }

        activeSession = null;
    };

    const onPointerMove = (event) => {
        if (!activeSession) return;

        const { control, panel: p, startPointer, originLeft, originTop, rect } = activeSession;

        if (event.touches?.length === 2 && activeSession.mode === 'pinch') {
            event.preventDefault();
            const dist = touchDistance(event.touches);
            if (!dist || !activeSession.pinchStartDist) return;
            const nextScale = clamp(
                activeSession.pinchStartScale * (dist / activeSession.pinchStartDist),
                SCALE_MIN,
                SCALE_MAX
            );
            activeSession.currentScale = nextScale;
            control.style.transform = `scale(${nextScale})`;
            return;
        }

        if (activeSession.mode !== 'drag') return;

        const pointer = getPointer(event);
        const dx = pointer.x - startPointer.x;
        const dy = pointer.y - startPointer.y;

        if (!activeSession.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
            return;
        }

        if (!activeSession.moved) {
            activeSession.moved = true;
            control.classList.add('is-dragging');
            document.body.classList.add('map-control-drag-active');
            if (leafletMap?.dragging) {
                leafletMap.dragging.disable();
            }
        }

        event.preventDefault();

        const left = originLeft + dx;
        const top = originTop + dy;
        const { width, height } = getPanelMetrics(p);
        const box = control.getBoundingClientRect();

        const maxLeft = Math.max(0, width - box.width);
        const maxTop = Math.max(0, height - box.height);

        control.style.left = `${clamp(left - rect.left, 0, maxLeft)}px`;
        control.style.top = `${clamp(top - rect.top, 0, maxTop)}px`;
    };

    const onPointerEnd = () => {
        endSession();
    };

    const onWheel = (event) => {
        if (!event.shiftKey) return;
        const control = event.target.closest('.map-draggable-control');
        if (!control || !panel.contains(control)) return;

        const id = control.dataset.mapControlId;
        if (!id) return;

        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.05 : 0.05;
        const current = scales[id] ?? 1;
        const next = clamp(current + delta, SCALE_MIN, SCALE_MAX);
        scales[id] = next;
        control.style.transform = `scale(${next})`;
        saveControlScale(id, next, scales);
    };

    const onControlPointerDown = (event) => {
        const control = event.currentTarget;
        const id = control.dataset.mapControlId;
        if (!id) return;

        if (isInteractiveDragBlocker(event.target)) return;

        if (event.touches?.length === 2) {
            activeSession = {
                mode: 'pinch',
                id,
                control,
                panel,
                positions,
                scales,
                map: leafletMap,
                pinchStartDist: touchDistance(event.touches),
                pinchStartScale: scales[id] ?? 1,
                currentScale: scales[id] ?? 1,
                moved: false
            };
            return;
        }

        const { rect } = getPanelMetrics(panel);
        const box = control.getBoundingClientRect();
        const pointer = getPointer(event);

        activeSession = {
            mode: 'drag',
            id,
            control,
            panel,
            positions,
            scales,
            map: leafletMap,
            startPointer: pointer,
            originLeft: box.left,
            originTop: box.top,
            rect,
            moved: false
        };
    };

    const onControlClick = (event) => {
        const control = event.currentTarget;
        if (control.dataset.dragSuppressed === 'true') {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };

    controls.forEach(({ el }) => {
        el.addEventListener('mousedown', onControlPointerDown);
        el.addEventListener('touchstart', onControlPointerDown, { passive: false });
        el.addEventListener('click', onControlClick, true);
    });

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerEnd);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerEnd);
    document.addEventListener('touchcancel', onPointerEnd);
    panel.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
        controls.forEach(({ el }) => applyControlLayout(el, panel, positions, scales));
    };

    window.addEventListener('resize', onResize);

    return () => {
        controls.forEach(({ el }) => {
            el.removeEventListener('mousedown', onControlPointerDown);
            el.removeEventListener('touchstart', onControlPointerDown);
            el.removeEventListener('click', onControlClick, true);
        });
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerEnd);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerEnd);
        document.removeEventListener('touchcancel', onPointerEnd);
        panel.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
        endSession();
    };
}

export default { initMapControlsDrag };
