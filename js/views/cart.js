// ============================================================
// js/views/cart.js – koszyk (KROK 5)
// ============================================================

import { getProducerById } from '../data/dataService.js';
import { navigateTo } from '../controllers/navigation.js';
import { showToast } from '../core/toast.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { t, formatNavLabel, formatCurrency } from '../core/i18n.js';
import { getCurrentUser } from '../auth/auth.js';
import { trackPurchase, trackReservation } from '../core/userHistory.js';
import { createReservation } from '../data/reservations.js';

const STORAGE_KEY = 'regionalny_smak_cart';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function activeStorageKey() {
    const user = getCurrentUser();
    return user ? `${STORAGE_KEY}__${user.id}` : STORAGE_KEY;
}

function readCart(key) {
    try {
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

let _initialized = false;

export function renderCart(container) {
    if (!container) return;
    injectStyles();
    render(container);
    bindEvents(container);
}

export function initCart() {
    if (_initialized) return;

    const container = document.getElementById('cartView');
    if (!container) return;

    injectStyles();
    render(container);
    bindEvents(container);
    _initialized = true;
}

function injectStyles() {
    if (document.getElementById('cart-view-styles')) return;

    const style = document.createElement('style');
    style.id = 'cart-view-styles';
    style.textContent = `
        .cart-page { display: flex; flex-direction: column; gap: var(--space-lg); }
        .cart-list { display: flex; flex-direction: column; gap: var(--space-sm); }
        .cart-item { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
        .cart-item .info { flex: 1; min-width: 160px; }
        .cart-item .name { font-weight: 600; }
        .cart-item .place { font-size: var(--text-sm); color: var(--text-muted); }
        .cart-item .price { font-weight: 600; color: var(--color-primary); min-width: 72px; text-align: right; }
        .cart-qty { display: flex; align-items: center; gap: var(--space-xs); }
        .cart-qty button { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--bg-card); font-size: var(--text-lg); }
        .cart-qty span { min-width: 24px; text-align: center; font-weight: 600; }
        .cart-remove { color: var(--color-error); font-size: var(--text-sm); padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: transparent; }
        .cart-summary { display: flex; justify-content: space-between; align-items: center; padding: var(--space-lg); margin-top: var(--space-sm); }
        .cart-summary strong { font-size: var(--text-lg); color: var(--color-accent); }
        .cart-actions { display: flex; flex-direction: column; gap: var(--space-md); }
    `;
    document.head.appendChild(style);
}

function getCart() {
    return readCart(activeStorageKey());
}

function setCart(items) {
    localStorage.setItem(activeStorageKey(), JSON.stringify(items));
    eventBus.emit(EVENTS.CART_CHANGED, { cart: items });
    updateNavBadge(items.reduce((n, i) => n + (i.quantity || 1), 0));
}

/** Po logowaniu przejmuje koszyk gościa, jeśli konto jeszcze go nie ma. */
export function adoptGuestCartForCurrentUser() {
    const user = getCurrentUser();
    if (!user) return;
    const userKey = `${STORAGE_KEY}__${user.id}`;
    const userItems = readCart(userKey);
    if (userItems.length) {
        updateNavBadge(userItems.reduce((n, i) => n + (i.quantity || 1), 0));
        return;
    }
    const guestItems = readCart(STORAGE_KEY);
    if (!guestItems.length) {
        updateNavBadge(0);
        return;
    }
    localStorage.setItem(userKey, JSON.stringify(guestItems));
    eventBus.emit(EVENTS.CART_CHANGED, { cart: guestItems });
    updateNavBadge(guestItems.reduce((n, i) => n + (i.quantity || 1), 0));
}

function updateNavBadge(count) {
    const label = document.querySelector('[data-view="cart"] .nav-label');
    if (label) {
        label.textContent = formatNavLabel('cart', count);
    }
}
function formatPrice(value) {
    return formatCurrency(value);
}

function getTotal(items) {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
}

function render(container) {
    const items = getCart();
    const total = getTotal(items);
    const count = items.reduce((n, i) => n + (i.quantity || 1), 0);

    container.innerHTML = `
        <div class="cart-page">
            <header class="view-hero">
                <h2>🛒 ${t('cart.title')}</h2>
                <p class="text-muted">${t('cart.subtitle')}</p>
            </header>
            ${count === 0 ? renderEmpty() : renderList(items, total)}
        </div>
    `;}

function renderEmpty() {
    return `
        <div class="empty-state card">
            <span class="empty-icon" aria-hidden="true">🛒</span>
            <p>${t('cart.empty')}</p>
            <p class="empty-sub">${t('cart.emptySub')}</p>
            <button type="button" id="cartGoMapBtn" class="btn-primary">${t('btn.discover')}</button>
        </div>
    `;
}
function renderList(items, total) {
    return `
        <div class="cart-list" id="cartList">
            ${items.map((item) => {
                const id = escapeHtml(item.id);
                const name = escapeHtml(item.name || t('cart.product'));
                const place = escapeHtml(item.place || '');
                return `
                <article class="list-item cart-item card" data-id="${id}">
                    <div class="info">
                        <div class="name">${name}</div>
                        <div class="place">${place}</div>
                    </div>
                    <div class="cart-qty">
                        <button type="button" data-qty="dec" data-id="${id}" aria-label="${escapeHtml(t('btn.less'))}">−</button>
                        <span>${item.quantity || 1}</span>
                        <button type="button" data-qty="inc" data-id="${id}" aria-label="${escapeHtml(t('btn.more'))}">+</button>
                    </div>
                    <div class="price">${formatPrice((item.price || 0) * (item.quantity || 1))}</div>
                    <button type="button" class="cart-remove" data-remove="${id}">${escapeHtml(t('btn.remove'))}</button>
                </article>`;
            }).join('')}
        </div>
        <div class="cart-summary card">
            <span>${t('cart.total')}</span>
            <strong>${formatPrice(total)}</strong>
        </div>
        <form id="cartReservationForm" class="cart-reservation card">
            <h3 class="cart-reservation-title">${t('reservations.checkout')}</h3>
            <label class="cart-reservation-field">
                <span>${t('reservations.pickupDay')}</span>
                <select name="pickupDay" required aria-label="${t('reservations.pickupDay')}">
                    <option value="today">${t('reservations.today')}</option>
                    <option value="tomorrow">${t('reservations.tomorrow')}</option>
                </select>
            </label>
            <label class="cart-reservation-field">
                <span>${t('reservations.pickupTime')}</span>
                <input type="time" name="pickupTime" required value="17:30" aria-label="${t('reservations.pickupTime')}">
            </label>
            <div class="cart-actions">
                <button type="submit" id="cartCheckoutBtn" class="btn-primary">${t('reservations.checkout')}</button>
                <button type="button" id="cartClearBtn" class="btn-secondary">${t('btn.clearCart')}</button>
            </div>
        </form>`;
}

export function refreshCartBadge() {
    updateNavBadge(getCart().reduce((n, i) => n + (i.quantity || 1), 0));
}

function bindEvents(container) {
    if (container.dataset.eventsBound === 'true') {
        updateNavBadge(getCart().reduce((n, i) => n + (i.quantity || 1), 0));
        return;
    }
    container.dataset.eventsBound = 'true';

    container.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('[data-qty]');
        if (qtyBtn) {
            const id = qtyBtn.dataset.id;
            const items = getCart();
            const item = items.find((i) => i.id === id);
            if (!item) return;
            if (qtyBtn.dataset.qty === 'inc') {
                item.quantity = (item.quantity || 1) + 1;
            } else {
                item.quantity = Math.max(1, (item.quantity || 1) - 1);
            }
            setCart(items);
            render(container);
            return;
        }

        const removeBtn = e.target.closest('[data-remove]');
        if (removeBtn) {
            setCart(getCart().filter((i) => i.id !== removeBtn.dataset.remove));
            render(container);
            return;
        }

        if (e.target.closest('#cartClearBtn')) {
            if (window.confirm(t('cart.confirmClear'))) {
                setCart([]);
                render(container);
            }
            return;
        }

        if (e.target.closest('#cartGoMapBtn')) {
            navigateTo('map');
            return;
        }

    });

    container.addEventListener('submit', (e) => {
        const form = e.target.closest('#cartReservationForm');
        if (!form) return;
        e.preventDefault();
        const btn = form.querySelector('#cartCheckoutBtn');
        if (btn?.disabled) return;
        if (btn) {
            btn.disabled = true;
            btn.setAttribute('aria-busy', 'true');
        }
        try {
            const user = getCurrentUser();
            if (!user) {
                showToast(t('reservations.needLogin'), 'error');
                return;
            }
            const items = getCart();
            const producerIds = [...new Set(items.map((i) => i.producerId).filter(Boolean))];
            // Jedna rezerwacja = jeden producent (needProducer w i18n)
            if (producerIds.length !== 1) {
                showToast(t('reservations.needProducer'), 'error');
                return;
            }
            const producer = getProducerById(producerIds[0]);
            if (!producer) {
                showToast(t('reservations.needProducer'), 'error');
                return;
            }
            const data = new FormData(form);
            const entry = createReservation({
                producerId: producer.id,
                producerName: producer.name,
                ownerId: producer.ownerId || '',
                userId: user.id,
                userName: user.displayName || user.email,
                items: items.map((i) => ({
                    productId: i.productId || i.id,
                    name: i.name,
                    quantity: i.quantity || 1,
                    unit: i.unit || ''
                })),
                pickupDay: String(data.get('pickupDay') || 'today'),
                pickupTime: String(data.get('pickupTime') || '17:30')
            });
            if (!entry) {
                showToast(t('reservations.error'), 'error');
                return;
            }
            trackReservation(entry.id, { producerId: producer.id });
            setCart([]);
            showToast(t('reservations.success'));
            render(container);
        } finally {
            if (btn?.isConnected) {
                btn.disabled = false;
                btn.removeAttribute('aria-busy');
            }
        }
    });

    updateNavBadge(getCart().reduce((n, i) => n + (i.quantity || 1), 0));
}

export function addProducerToCart(producerId) {
    const producer = getProducerById(producerId);
    if (!producer) return;

    const firstProduct = producer.products?.[0];
    const product = firstProduct
        ? { name: firstProduct.name, price: firstProduct.price }
        : { name: t('productDefault'), price: 5 };
    addToCart({
        id: `prod-${producer.id}-${firstProduct?.id || 'default'}`,
        productId: firstProduct?.id || '',
        producerId: producer.id,
        name: product.name,
        place: producer.name,
        price: product.price,
        unit: firstProduct?.unit || ''
    });
}

export function addToCart(item) {
    const items = getCart();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        items.push({ ...item, quantity: 1, addedAt: Date.now() });
    }
    setCart(items);
    try {
        trackPurchase(item.id, { name: item.name, place: item.place });
    } catch (_) {
        /* ignore */
    }
}

export function getCartCount() {
    return getCart().reduce((n, i) => n + (i.quantity || 1), 0);
}

export function getCartItems() {
    return getCart();
}

export function removeCartItem(id) {
    setCart(getCart().filter((i) => i.id !== id));
}
