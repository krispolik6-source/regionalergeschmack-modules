/**
 * Polyfille dla iOS 9 – Promise jest natywny, fetch i includes wymagają uzupełnienia.
 */
(function (global) {
    'use strict';

    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: function includes(searchElement, fromIndex) {
                var o = Object(this);
                var len = parseInt(o.length, 10) || 0;
                if (len === 0) return false;
                var n = parseInt(fromIndex, 10) || 0;
                var k = n >= 0 ? n : Math.max(len + n, 0);
                while (k < len) {
                    if (o[k] === searchElement ||
                        (searchElement !== searchElement && o[k] !== o[k])) {
                        return true;
                    }
                    k += 1;
                }
                return false;
            },
            writable: true,
            configurable: true
        });
    }

    if (!String.prototype.includes) {
        Object.defineProperty(String.prototype, 'includes', {
            value: function includes(search, start) {
                if (typeof search !== 'string') {
                    throw new TypeError('search must be a string');
                }
                var str = String(this);
                var pos = start ? Number(start) : 0;
                if (pos !== pos) pos = 0;
                if (pos + search.length > str.length) return false;
                return str.indexOf(search, pos) !== -1;
            },
            writable: true,
            configurable: true
        });
    }

    if (!Object.assign) {
        Object.assign = function assign(target) {
            if (target == null) throw new TypeError('Cannot convert undefined or null to object');
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var next = arguments[i];
                if (next != null) {
                    for (var key in next) {
                        if (Object.prototype.hasOwnProperty.call(next, key)) {
                            to[key] = next[key];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (!global.Promise) {
        global.Promise = function PromiseStub() {
            throw new Error('Promise polyfill required – załaduj es6-promise');
        };
    }
}(window));
