/**
 * Wykrywa iOS 9 / stare Safari i dodaje klasę legacy-ios9 na <html>.
 * Musi być załadowany synchronicznie przed CSS (inline w index.html).
 */
(function (global) {
    var doc = global.document;
    var ua = global.navigator.userAgent || '';

    var isIOS9 = /(?:iPad|iPhone|iPod).+OS 9[_\d]/i.test(ua);
    var isOldSafari = /Version\/9\./.test(ua) && /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
    var noModules = !('noModule' in doc.createElement('script'));

    var supportsClamp = false;
    try {
        var probe = doc.createElement('div');
        probe.style.fontSize = 'clamp(1px,1px,1px)';
        var fs = probe.style.fontSize || '';
        // iOS 9 ignoruje clamp (puste lub px); nowoczesne: clamp(...) lub calc(...)
        supportsClamp = fs.indexOf('clamp') !== -1 || fs.indexOf('calc') !== -1;
    } catch (e) {
        supportsClamp = false;
    }
    var noClamp = !supportsClamp;

    if (isIOS9 || isOldSafari || noModules || noClamp) {
        var root = doc.documentElement;
        if (root.className.indexOf('legacy-ios9') === -1) {
            root.className += (root.className ? ' ' : '') + 'legacy-ios9';
        }
        global.__RG_LEGACY__ = true;
    }
}(window));
