/**
 * Premium splash — fade + scale (transform/opacity only), bez sztucznych opóźnień.
 */

const SPLASH_EXIT_MS = 280;
const SPLASH_EXIT_FALLBACK_MS = 360;

let splashDismissed = false;

export function dismissSplashScreen() {
    if (splashDismissed) return;
    splashDismissed = true;

    const splash = document.getElementById('rgSplashScreen');
    const root = document.documentElement;

    if (!splash) {
        root.classList.remove('rg-booting', 'dark-mode-boot');
        document.body.classList.remove('rg-booting');
        return;
    }

    splash.classList.remove('is-entering');
    splash.classList.add('is-exiting');

    const cleanup = () => {
        splash.remove();
        root.classList.remove('rg-booting', 'dark-mode-boot');
        document.body.classList.remove('rg-booting');
    };

    splash.addEventListener('transitionend', (event) => {
        if (event.target === splash && event.propertyName === 'opacity') {
            cleanup();
        }
    }, { once: true });

    window.setTimeout(cleanup, SPLASH_EXIT_FALLBACK_MS);
}
