// js/core/toast.js – lekkie powiadomienia zamiast alert()
import { CONFIG, Z_INDEX } from '../config.js';

let toastEl = null;
let hideTimer = null;

export function showToast(message, type = 'info') {
    if (!message) return;

    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'appToast';
        toastEl.className = 'app-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.dataset.type = type;
    toastEl.hidden = false;
    toastEl.classList.add('app-toast--visible');

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        toastEl?.classList.remove('app-toast--visible');
        if (toastEl) toastEl.hidden = true;
    }, CONFIG.TOAST_DURATION ?? 1800);
}

export function initToast() {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .app-toast {
                position: fixed;
                left: 50%;
                bottom: calc(var(--nav-height) + var(--safe-bottom) + 16px);
                transform: translateX(-50%) translateY(12px);
                z-index: ${Z_INDEX.toast};
                max-width: min(420px, calc(100vw - 32px));
                padding: 12px 18px;
                border-radius: var(--radius-pill, 999px);
                background: rgba(42, 34, 24, 0.86);
                color: #fffaf2;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.4;
                text-align: center;
                border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.18));
                box-shadow: var(--glass-shadow, 0 6px 24px rgba(15, 40, 30, 0.22));
                -webkit-backdrop-filter: blur(var(--glass-blur, 8px)) saturate(var(--glass-saturate, 128%));
                backdrop-filter: blur(var(--glass-blur, 8px)) saturate(var(--glass-saturate, 128%));
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .app-toast--visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            body.dark-mode .app-toast {
                background: rgba(42, 34, 24, 0.92);
                border-color: rgba(255, 220, 170, 0.14);
            }
            @media (prefers-reduced-motion: reduce) {
                .app-toast { transition: none; }
            }
        `;
        document.head.appendChild(style);
    }
}
