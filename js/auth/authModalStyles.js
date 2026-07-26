// js/auth/authModalStyles.js – wspólne style modali logowania/rejestracji

export function injectAuthModalStyles() {
    if (document.getElementById('auth-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'auth-modal-styles';
    style.textContent = `
        .auth-modal { position: fixed; inset: 0; z-index: 1550; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .auth-modal[hidden] { display: none !important; }
        .auth-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.45); }
        .auth-modal-dialog { position: relative; width: min(100%, 420px); max-height: 90vh; overflow: auto; background: var(--color-card, #fff); border-radius: var(--radius-lg, 14px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); padding: 24px; }
        .auth-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .auth-modal-header h2 { margin: 0; font-size: 1.15rem; }
        .auth-modal-close { border: none; background: transparent; font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--color-text-muted); min-width: 44px; min-height: 44px; }
        .auth-form { display: flex; flex-direction: column; gap: 12px; }
        .auth-field label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
        .auth-field input, .auth-field select { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font: inherit; background: var(--color-card); color: var(--color-text); box-sizing: border-box; }
        .auth-error { color: #b42318; font-size: 0.85rem; min-height: 1.2em; }
        .auth-trial-note { font-size: 0.8rem; color: var(--color-text-muted); margin: 0; }
        .auth-switch { margin-top: 12px; text-align: center; font-size: 0.9rem; }
        .auth-switch button { background: none; border: none; color: var(--color-accent); font-weight: 600; cursor: pointer; text-decoration: underline; padding: 4px; }
        .auth-type-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .auth-type-btn { min-height: 44px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); cursor: pointer; font: inherit; font-weight: 600; }
        .auth-type-btn.is-active { border-color: var(--color-primary); background: rgba(79, 107, 60, 0.12); color: var(--color-primary); }
        .auth-checkboxes { display: flex; flex-wrap: wrap; gap: 8px 12px; margin-top: 6px; }
        .auth-check { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);
}

export function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
