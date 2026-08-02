// js/map/draggableProducerPopup.js – przeciąganie popupu producenta (Leaflet 1.9.x)

const DRAG_THRESHOLD_PX = 8;
const VIEWPORT_MARGIN_PX = 8;
const SCROLL_MOVE_THRESHOLD_PX = 4;
const POPUP_SCROLL_DIAG_PREFIX = '[PopupScrollDiag]';

/** @type {{ dragging?: boolean, touchZoom?: boolean } | null} */
let mapInteractionLock = null;
/** @type {'scroll' | 'drag' | null} */
let mapInteractionLockReason = null;

/** Szerokość popupu producenta — spójna z bindPopup maxWidth/minWidth. */
export function getProducerPopupTargetWidth(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360) {
    const vw = Number(viewportWidth) || 360;
    const max = 320;
    const min = 240;
    return Math.min(max, Math.max(min, vw - 24));
}

/**
 * Wymusza pełną szerokość popupu (naprawa wąskiego pionowego paska).
 * @param {import('leaflet').Popup} popup
 */
export function ensureProducerPopupLayout(popup) {
    if (!popup?._container) return;

    const width = getProducerPopupTargetWidth();
    const wrapper = popup._contentNode?.parentElement;
    const content = popup._contentNode;
    const mapPopup = content?.querySelector?.('.map-popup');

    if (popup.options) {
        popup.options.maxWidth = width;
        popup.options.minWidth = Math.min(width, 280);
    }

    popup._container.style.width = `${width}px`;
    popup._container.style.minWidth = `${width}px`;
    popup._container.style.maxWidth = `${width}px`;

    if (wrapper) {
        wrapper.style.width = '100%';
        wrapper.style.minWidth = '100%';
        wrapper.style.maxWidth = '100%';
        wrapper.style.boxSizing = 'border-box';
    }

    if (content) {
        content.style.width = '100%';
        content.style.minWidth = '0';
        content.style.maxWidth = '100%';
        content.style.boxSizing = 'border-box';
    }

    if (mapPopup) {
        mapPopup.style.width = '100%';
        mapPopup.style.minWidth = '0';
        mapPopup.style.boxSizing = 'border-box';
    }

    try {
        popup.update?.();
    } catch (_) {
        /* ignore */
    }
}

/** @type {{ popup: import('leaflet').Popup, map: import('leaflet').Map, startPointer: { x: number, y: number }, originOffset: import('leaflet').Point, moved: boolean } | null} */
let activeSession = null;

function getPointer(event) {
    return { x: event.clientX, y: event.clientY };
}

function isLocalhostPopupScrollDiag() {
    if (typeof window === 'undefined') return false;
    try {
        const host = String(window.location?.hostname || '').toLowerCase();
        return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    } catch {
        return false;
    }
}

function getPopupScrollMetrics(scrollRoot) {
    return {
        popupHeight: scrollRoot?.clientHeight ?? 0,
        scrollHeight: scrollRoot?.scrollHeight ?? 0,
        viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0
    };
}

function popupScrollDiag(message, scrollRoot, extra = {}) {
    if (!isLocalhostPopupScrollDiag()) return;
    try {
        console.info(POPUP_SCROLL_DIAG_PREFIX, message, {
            ...getPopupScrollMetrics(scrollRoot),
            ...extra
        });
    } catch {
        /* ignore */
    }
}

function isScrollableRoot(el) {
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + 1;
}

function isInteractivePopupTarget(target) {
    return Boolean(target?.closest?.(
        'button, a[href], input, textarea, select, label, '
        + '[data-promo-toggle], [data-details-id], [data-favorite-id], '
        + '.leaflet-popup-close-button, .map-popup-btn, .map-popup-btn--link, '
        + '.promo-flyer-toggle, .rg-ad-popup-link'
    ));
}

function isDragHandleTarget(target, dragHandle) {
    return Boolean(dragHandle && target && (target === dragHandle || dragHandle.contains(target)));
}

function lockMapInteraction(map, reason, scrollRoot) {
    if (!map || mapInteractionLock) return;
    mapInteractionLock = {
        dragging: Boolean(map.dragging?.enabled?.()),
        touchZoom: Boolean(map.touchZoom?.enabled?.())
    };
    mapInteractionLockReason = reason;
    if (map.dragging) map.dragging.disable();
    if (map.touchZoom) map.touchZoom.disable();
    document.body.classList.add('map-popup-scroll-active');
    if (reason === 'scroll') {
        popupScrollDiag('popup scroll start', scrollRoot);
    }
    popupScrollDiag('map dragging disabled', scrollRoot, { reason });
}

function unlockMapInteraction(map, reason, scrollRoot, force = false) {
    if (!mapInteractionLock) return;
    if (!force && reason && mapInteractionLockReason && reason !== mapInteractionLockReason) return;

    const wasScroll = mapInteractionLockReason === 'scroll';
    if (mapInteractionLock.dragging && map?.dragging) map.dragging.enable();
    if (mapInteractionLock.touchZoom && map?.touchZoom) map.touchZoom.enable();
    mapInteractionLock = null;
    mapInteractionLockReason = null;
    document.body.classList.remove('map-popup-scroll-active');
    if (wasScroll) {
        popupScrollDiag('popup scroll end', scrollRoot);
    }
    popupScrollDiag('map dragging enabled', scrollRoot, { reason: reason || 'unknown' });
}

/**
 * Odczyt safe-area (notch) w px — env() przez getComputedStyle (iOS).
 * @returns {{ top: number, right: number, bottom: number, left: number }}
 */
function readSafeAreaInsets() {
    let probe = document.getElementById('rg-safe-area-probe');
    if (!probe) {
        probe = document.createElement('div');
        probe.id = 'rg-safe-area-probe';
        probe.style.cssText = [
            'position:fixed',
            'visibility:hidden',
            'pointer-events:none',
            'z-index:-1',
            'top:env(safe-area-inset-top,0px)',
            'left:env(safe-area-inset-left,0px)',
            'right:env(safe-area-inset-right,0px)',
            'bottom:env(safe-area-inset-bottom,0px)',
            'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'
        ].join(';');
        document.documentElement.appendChild(probe);
    }
    const cs = getComputedStyle(probe);
    return {
        top: parseFloat(cs.paddingTop) || 0,
        right: parseFloat(cs.paddingRight) || 0,
        bottom: parseFloat(cs.paddingBottom) || 0,
        left: parseFloat(cs.paddingLeft) || 0
    };
}

/**
 * Granice clampu: przecięcie kontenera mapy z viewport + safe-area.
 * @param {import('leaflet').Map} map
 */
function getPopupBounds(map) {
    const mapRect = map.getContainer().getBoundingClientRect();
    const safe = readSafeAreaInsets();

    const minLeft = Math.max(mapRect.left + VIEWPORT_MARGIN_PX, safe.left + VIEWPORT_MARGIN_PX);
    const minTop = Math.max(mapRect.top + VIEWPORT_MARGIN_PX, safe.top + VIEWPORT_MARGIN_PX);
    const maxRight = Math.min(mapRect.right - VIEWPORT_MARGIN_PX, window.innerWidth - safe.right - VIEWPORT_MARGIN_PX);
    const maxBottom = Math.min(mapRect.bottom - VIEWPORT_MARGIN_PX, window.innerHeight - safe.bottom - VIEWPORT_MARGIN_PX);

    return { minLeft, minTop, maxRight, maxBottom };
}

/**
 * @param {import('leaflet').Popup} popup
 * @param {import('leaflet').Map} map
 */
function applyScrollConstraints(popup, map) {
    const wrapper = popup._contentNode?.parentElement;
    if (!wrapper || !map?.getContainer) return;

    const { minTop, maxBottom } = getPopupBounds(map);
    const mapBoundHeight = Math.max(120, maxBottom - minTop);
    const viewportCap = Math.max(120, window.innerHeight * 0.9);
    const maxHeight = Math.min(mapBoundHeight, viewportCap);

    wrapper.style.maxHeight = `${maxHeight}px`;
    wrapper.style.overflowY = 'auto';
    wrapper.style.overflowX = 'hidden';
    wrapper.style.overscrollBehavior = 'contain';
    wrapper.style.webkitOverflowScrolling = 'touch';
    wrapper.style.touchAction = 'pan-y';
}

function clearScrollConstraints(popup) {
    const wrapper = popup._contentNode?.parentElement;
    if (!wrapper) return;
    wrapper.style.maxHeight = '';
    wrapper.style.overflowY = '';
    wrapper.style.overflowX = '';
    wrapper.style.overscrollBehavior = '';
    wrapper.style.webkitOverflowScrolling = '';
    wrapper.style.touchAction = '';
}

/**
 * @param {import('leaflet').Popup} popup
 * @param {import('leaflet').Map} map
 * @param {import('leaflet').Point} dragOffset
 * @param {() => void} baseUpdatePosition
 */
function clampDragOffset(popup, map, dragOffset, baseUpdatePosition) {
    const L = window.L;
    const container = popup?._container;
    if (!L || !container || !map?.getContainer) return dragOffset;

    baseUpdatePosition();
    const pos = L.DomUtil.getPosition(container);
    L.DomUtil.setPosition(container, pos.add(dragOffset));

    const { minLeft, minTop, maxRight, maxBottom } = getPopupBounds(map);
    const rect = container.getBoundingClientRect();
    let adjustX = 0;
    let adjustY = 0;

    if (rect.left < minLeft) adjustX = minLeft - rect.left;
    if (rect.top < minTop) adjustY = minTop - rect.top;
    if (rect.right > maxRight) adjustX = maxRight - rect.right;
    if (rect.bottom > maxBottom) adjustY = maxBottom - rect.bottom;

    const closeBtn = container.querySelector('.leaflet-popup-close-button');
    if (closeBtn) {
        const closeRect = closeBtn.getBoundingClientRect();
        if (closeRect.left < minLeft) adjustX = Math.max(adjustX, minLeft - closeRect.left);
        if (closeRect.top < minTop) adjustY = Math.max(adjustY, minTop - closeRect.top);
        if (closeRect.right > maxRight) adjustX = Math.min(adjustX, maxRight - closeRect.right);
        if (closeRect.bottom > maxBottom) adjustY = Math.min(adjustY, maxBottom - closeRect.bottom);
    }

    return L.point(dragOffset.x + adjustX, dragOffset.y + adjustY);
}

/**
 * @param {import('leaflet').Popup} popup
 * @param {import('leaflet').Map} map
 * @returns {() => void}
 */
export function attachDraggableProducerPopup(popup, map) {
    if (!popup || !map || !window.L) return () => {};

    if (typeof popup.__rgDragCleanup === 'function') {
        popup.__rgDragCleanup();
    }

    const L = window.L;
    const container = popup._container;
    const wrapper = popup._contentNode?.parentElement;
    if (!container || !wrapper) return () => {};

    const dragHandle = container.querySelector('.producer-header-top');
    if (!dragHandle) return () => {};

    dragHandle.classList.add('map-popup-drag-handle');

    ensureProducerPopupLayout(popup);

    const dragOffset = L.point(0, 0);
    const originalUpdatePosition = popup._updatePosition.bind(popup);

    const baseUpdatePosition = () => {
        originalUpdatePosition();
        if (dragOffset.x || dragOffset.y) {
            const pos = L.DomUtil.getPosition(container);
            L.DomUtil.setPosition(container, pos.add(dragOffset));
        }
    };

    popup._updatePosition = baseUpdatePosition;

    const hideTipIfDragged = () => {
        if (!dragOffset.x && !dragOffset.y) return;
        const tip = container.querySelector('.leaflet-popup-tip-container');
        if (tip) tip.style.opacity = '0';
    };

    const applyClamp = () => {
        const clamped = clampDragOffset(popup, map, dragOffset, originalUpdatePosition);
        dragOffset.x = clamped.x;
        dragOffset.y = clamped.y;
        baseUpdatePosition();
        hideTipIfDragged();
    };

    applyScrollConstraints(popup, map);

    const onResize = () => {
        ensureProducerPopupLayout(popup);
        applyScrollConstraints(popup, map);
        applyClamp();
    };

    map.on('resize', onResize);
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);

    const endSession = () => {
        if (!activeSession || activeSession.popup !== popup) return;

        const { moved } = activeSession;

        container.classList.remove('is-dragging-popup');
        dragHandle.classList.remove('is-dragging');
        document.body.classList.remove('map-popup-drag-active');

        if (moved) {
            unlockMapInteraction(map, 'drag', wrapper, true);
            container.dataset.dragSuppressed = 'true';
            window.setTimeout(() => {
                delete container.dataset.dragSuppressed;
            }, 0);
        }

        activeSession = null;
    };

    const onPointerMove = (event) => {
        if (!activeSession || activeSession.popup !== popup) return;

        const pointer = getPointer(event);
        const dx = pointer.x - activeSession.startPointer.x;
        const dy = pointer.y - activeSession.startPointer.y;

        if (!activeSession.moved) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
            activeSession.moved = true;
            container.classList.add('is-dragging-popup');
            dragHandle.classList.add('is-dragging');
            document.body.classList.add('map-popup-drag-active');
            lockMapInteraction(map, 'drag', wrapper);
        }

        event.preventDefault();

        dragOffset.x = activeSession.originOffset.x + dx;
        dragOffset.y = activeSession.originOffset.y + dy;

        const clamped = clampDragOffset(popup, map, dragOffset, originalUpdatePosition);
        dragOffset.x = clamped.x;
        dragOffset.y = clamped.y;
        baseUpdatePosition();
        hideTipIfDragged();
    };

    const onPointerEnd = () => {
        endSession();
    };

    const onPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;

        activeSession = {
            popup,
            map,
            startPointer: getPointer(event),
            originOffset: L.point(dragOffset.x, dragOffset.y),
            moved: false
        };

        try {
            dragHandle.setPointerCapture(event.pointerId);
        } catch (_) {
            /* ignore */
        }
    };

    const onClickCapture = (event) => {
        if (container.dataset.dragSuppressed === 'true') {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };

    dragHandle.addEventListener('pointerdown', onPointerDown);
    dragHandle.addEventListener('lostpointercapture', onPointerEnd);
    container.addEventListener('click', onClickCapture, true);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerEnd);
    document.addEventListener('pointercancel', onPointerEnd);

    /** @type {{ startPointer: { x: number, y: number }, decided: boolean } | null} */
    let scrollGesture = null;

    const onScrollPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        if (isDragHandleTarget(event.target, dragHandle)) return;
        if (isInteractivePopupTarget(event.target)) return;
        if (!isScrollableRoot(wrapper)) return;

        scrollGesture = {
            startPointer: getPointer(event),
            decided: false
        };
        lockMapInteraction(map, 'scroll', wrapper);
    };

    const onScrollPointerMove = (event) => {
        if (!scrollGesture || activeSession?.moved) return;
        if (isDragHandleTarget(event.target, dragHandle)) return;

        const pointer = getPointer(event);
        const dy = Math.abs(pointer.y - scrollGesture.startPointer.y);
        const dx = Math.abs(pointer.x - scrollGesture.startPointer.x);

        if (!scrollGesture.decided && (dy > SCROLL_MOVE_THRESHOLD_PX || dx > SCROLL_MOVE_THRESHOLD_PX)) {
            scrollGesture.decided = true;
        }

        if (mapInteractionLockReason === 'scroll') {
            event.stopPropagation();
        }
    };

    const onScrollPointerEnd = () => {
        if (scrollGesture && mapInteractionLockReason === 'scroll') {
            unlockMapInteraction(map, 'scroll', wrapper);
        }
        scrollGesture = null;
    };

    const onTouchMoveCapture = (event) => {
        if (mapInteractionLockReason === 'scroll' || scrollGesture) {
            event.stopPropagation();
        }
    };

    const onWheelCapture = (event) => {
        if (!isScrollableRoot(wrapper)) return;
        if (!wrapper.contains(event.target)) return;
        event.stopPropagation();
        if (!mapInteractionLock) {
            lockMapInteraction(map, 'scroll', wrapper);
            window.setTimeout(() => {
                if (mapInteractionLockReason === 'scroll') {
                    unlockMapInteraction(map, 'scroll', wrapper);
                }
            }, 120);
        }
    };

    wrapper.addEventListener('pointerdown', onScrollPointerDown);
    wrapper.addEventListener('pointermove', onScrollPointerMove);
    wrapper.addEventListener('pointerup', onScrollPointerEnd);
    wrapper.addEventListener('pointercancel', onScrollPointerEnd);
    wrapper.addEventListener('touchmove', onTouchMoveCapture, { capture: true, passive: true });
    wrapper.addEventListener('wheel', onWheelCapture, { capture: true, passive: true });

    if (L.DomEvent?.disableScrollPropagation) {
        L.DomEvent.disableScrollPropagation(wrapper);
    }
    if (L.DomEvent?.disableClickPropagation) {
        L.DomEvent.disableClickPropagation(wrapper);
    }
    if (L.DomEvent?.disableClickPropagation) {
        L.DomEvent.disableClickPropagation(container);
    }

    requestAnimationFrame(() => {
        ensureProducerPopupLayout(popup);
        applyClamp();
        applyScrollConstraints(popup, map);
    });

    const cleanup = () => {
        endSession();
        scrollGesture = null;
        unlockMapInteraction(map, 'cleanup', wrapper, true);
        dragHandle.removeEventListener('pointerdown', onPointerDown);
        dragHandle.removeEventListener('lostpointercapture', onPointerEnd);
        container.removeEventListener('click', onClickCapture, true);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerEnd);
        document.removeEventListener('pointercancel', onPointerEnd);
        wrapper.removeEventListener('pointerdown', onScrollPointerDown);
        wrapper.removeEventListener('pointermove', onScrollPointerMove);
        wrapper.removeEventListener('pointerup', onScrollPointerEnd);
        wrapper.removeEventListener('pointercancel', onScrollPointerEnd);
        wrapper.removeEventListener('touchmove', onTouchMoveCapture, true);
        wrapper.removeEventListener('wheel', onWheelCapture, true);
        map.off('resize', onResize);
        window.removeEventListener('resize', onResize);
        window.visualViewport?.removeEventListener('resize', onResize);
        popup._updatePosition = originalUpdatePosition;
        clearScrollConstraints(popup);
        container.classList.remove('is-dragging-popup');
        dragHandle.classList.remove('is-dragging', 'map-popup-drag-handle');
        document.body.classList.remove('map-popup-scroll-active');
        delete container.dataset.dragSuppressed;
        const tip = container.querySelector('.leaflet-popup-tip-container');
        if (tip) tip.style.opacity = '';
        delete popup.__rgDragCleanup;
    };

    popup.__rgDragCleanup = cleanup;
    return cleanup;
}

/**
 * @param {import('leaflet').Popup | null | undefined} popup
 */
export function detachDraggableProducerPopup(popup) {
    if (typeof popup?.__rgDragCleanup === 'function') {
        popup.__rgDragCleanup();
    }
}

export default {
    attachDraggableProducerPopup,
    detachDraggableProducerPopup,
    ensureProducerPopupLayout,
    getProducerPopupTargetWidth
};
