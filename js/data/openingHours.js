// js/data/openingHours.js – ocena OSM opening_hours (praktyczny parser)

const DAY_INDEX = Object.freeze({
    su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6,
    sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
});

const DAY_ORDER = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];

/**
 * @param {string} raw
 * @returns {string}
 */
export function normalizeOpeningHours(raw) {
    return String(raw || '').trim();
}

/**
 * @param {string} hhmm
 * @returns {number | null} minutes from midnight
 */
function parseTimeToMinutes(hhmm) {
    const m = String(hhmm || '').trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (!Number.isFinite(h) || !Number.isFinite(min) || h > 24 || min > 59) return null;
    if (h === 24 && min === 0) return 24 * 60;
    if (h === 24) return null;
    return h * 60 + min;
}

/**
 * @param {string} token e.g. Mo-Fr or Sa,Su or PH
 * @returns {number[] | null}
 */
function expandDayToken(token) {
    const t = String(token || '').trim().toLowerCase();
    if (!t || t === 'ph' || t === 'sh') return null;
    if (t === 'mo-su' || t === '24/7') return [0, 1, 2, 3, 4, 5, 6];

    if (t.includes('-')) {
        const [a, b] = t.split('-').map((x) => x.trim());
        const start = DAY_INDEX[a];
        const end = DAY_INDEX[b];
        if (start == null || end == null) return null;
        const days = [];
        let i = DAY_ORDER.indexOf(a.slice(0, 2));
        const endIdx = DAY_ORDER.indexOf(b.slice(0, 2));
        if (i < 0 || endIdx < 0) {
            // fallback via DAY_INDEX values
            let cur = start;
            for (let n = 0; n < 7; n += 1) {
                days.push(cur);
                if (cur === end) break;
                cur = (cur + 1) % 7;
            }
            return days;
        }
        for (let n = 0; n < 7; n += 1) {
            days.push(DAY_INDEX[DAY_ORDER[i]]);
            if (i === endIdx) break;
            i = (i + 1) % 7;
        }
        return days;
    }

    const day = DAY_INDEX[t] ?? DAY_INDEX[t.slice(0, 2)];
    return day == null ? null : [day];
}

/**
 * @param {string} part
 * @returns {{ days: number[], ranges: Array<[number, number]> } | null}
 */
function parseRulePart(part) {
    const cleaned = String(part || '').trim();
    if (!cleaned) return null;
    if (/^24\/7$/i.test(cleaned)) {
        return { days: [0, 1, 2, 3, 4, 5, 6], ranges: [[0, 24 * 60]] };
    }

    // "Mo-Fr 09:00-18:00" | "Sa,Su 10:00-14:00" | "09:00-18:00"
    const match = cleaned.match(/^([A-Za-z][A-Za-z0-9,\-\s]*?)\s+(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)$/);
    const timeOnly = cleaned.match(/^(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)$/);

    let dayPart = '';
    let timePart = '';
    if (match) {
        dayPart = match[1];
        timePart = match[2];
    } else if (timeOnly) {
        dayPart = 'Mo-Su';
        timePart = timeOnly[1];
    } else if (/^off$/i.test(cleaned)) {
        return { days: [0, 1, 2, 3, 4, 5, 6], ranges: [] };
    } else {
        return null;
    }

    const days = [];
    for (const token of dayPart.split(',')) {
        const expanded = expandDayToken(token.trim());
        if (!expanded) continue;
        expanded.forEach((d) => {
            if (!days.includes(d)) days.push(d);
        });
    }
    if (!days.length) return null;

    const ranges = [];
    for (const span of timePart.split(',')) {
        const [fromRaw, toRaw] = span.split('-').map((s) => s.trim());
        const from = parseTimeToMinutes(fromRaw);
        let to = parseTimeToMinutes(toRaw);
        if (from == null || to == null) continue;
        if (to === 0) to = 24 * 60;
        ranges.push([from, to]);
    }

    return { days, ranges };
}

/**
 * @param {string} openingHours
 * @param {Date} [now]
 * @returns {boolean | null} true/false or null if unknown
 */
export function isOpenNow(openingHours, now = new Date()) {
    const raw = normalizeOpeningHours(openingHours);
    if (!raw) return null;
    if (/^24\/7$/i.test(raw)) return true;

    const rules = [];
    for (const chunk of raw.split(';')) {
        const rule = parseRulePart(chunk.trim());
        if (rule) rules.push(rule);
    }
    if (!rules.length) return null;

    const day = now.getDay(); // 0=Sun
    const minutes = now.getHours() * 60 + now.getMinutes();

    // later rules override earlier for same day (OSM convention simplified)
    let dayRanges = null;
    for (const rule of rules) {
        if (rule.days.includes(day)) {
            dayRanges = rule.ranges;
        }
    }
    if (!dayRanges) return false;
    if (!dayRanges.length) return false;

    for (const [from, to] of dayRanges) {
        if (to > from) {
            if (minutes >= from && minutes < to) return true;
        } else {
            // overnight e.g. 18:00-02:00
            if (minutes >= from || minutes < to) return true;
        }
    }
    return false;
}

/**
 * @param {{ openingHours?: string, hours?: string }} producer
 * @param {Date} [now]
 * @returns {{ known: boolean, isOpen: boolean | null, hours: string }}
 */
export function getProducerOpenStatus(producer, now = new Date()) {
    const hours = normalizeOpeningHours(producer?.openingHours || producer?.hours || '');
    if (!hours) {
        return { known: false, isOpen: null, hours: '' };
    }
    const open = isOpenNow(hours, now);
    if (open === null) {
        return { known: false, isOpen: null, hours };
    }
    return { known: true, isOpen: open, hours };
}

function formatMinutes(total) {
    const mins = ((Number(total) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseAllRules(openingHours) {
    const raw = normalizeOpeningHours(openingHours);
    if (!raw) return [];
    if (/^24\/7$/i.test(raw)) {
        return [{ days: [0, 1, 2, 3, 4, 5, 6], ranges: [[0, 24 * 60]] }];
    }
    const rules = [];
    for (const chunk of raw.split(';')) {
        const rule = parseRulePart(chunk.trim());
        if (rule) rules.push(rule);
    }
    return rules;
}

function rangesForDay(rules, day) {
    let dayRanges = null;
    for (const rule of rules) {
        if (rule.days.includes(day)) dayRanges = rule.ranges;
    }
    return dayRanges || [];
}

/**
 * Czytelny status godzin: otwarte + zamyka o / zamknięte + otwarcie jutro.
 * @param {{ openingHours?: string, hours?: string }} producer
 * @param {Date} [now]
 */
export function getOpeningHoursDisplay(producer, now = new Date()) {
    const status = getProducerOpenStatus(producer, now);
    if (!status.known) {
        return {
            known: false,
            isOpen: null,
            hours: status.hours,
            closesAt: '',
            opensAt: '',
            opensTomorrow: false
        };
    }

    const rules = parseAllRules(status.hours);
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const today = rangesForDay(rules, day);

    if (status.isOpen) {
        let closesAt = '';
        for (const [from, to] of today) {
            const inRange = to > from
                ? minutes >= from && minutes < to
                : minutes >= from || minutes < to;
            if (inRange) {
                closesAt = formatMinutes(to >= 24 * 60 ? 0 : to);
                break;
            }
        }
        return {
            known: true,
            isOpen: true,
            hours: status.hours,
            closesAt,
            opensAt: '',
            opensTomorrow: false
        };
    }

    // Najbliższe otwarcie dziś lub jutro
    for (const [from] of today) {
        if (from > minutes) {
            return {
                known: true,
                isOpen: false,
                hours: status.hours,
                closesAt: '',
                opensAt: formatMinutes(from),
                opensTomorrow: false
            };
        }
    }

    const tomorrow = (day + 1) % 7;
    const nextRanges = rangesForDay(rules, tomorrow);
    if (nextRanges.length) {
        return {
            known: true,
            isOpen: false,
            hours: status.hours,
            closesAt: '',
            opensAt: formatMinutes(nextRanges[0][0]),
            opensTomorrow: true
        };
    }

    return {
        known: true,
        isOpen: false,
        hours: status.hours,
        closesAt: '',
        opensAt: '',
        opensTomorrow: false
    };
}

/**
 * Okno otwarcia względem „teraz” (lokalnie, bez sieci).
 * @param {{ openingHours?: string, hours?: string }} producer
 * @param {Date} [now]
 * @returns {{
 *   known: boolean,
 *   isOpen: boolean | null,
 *   minutesSinceOpen: number | null,
 *   minutesUntilClose: number | null,
 *   opensAt: string,
 *   closesAt: string
 * }}
 */
export function getOpenTiming(producer, now = new Date()) {
    const display = getOpeningHoursDisplay(producer, now);
    if (!display.known || !display.isOpen) {
        return {
            known: display.known,
            isOpen: display.isOpen,
            minutesSinceOpen: null,
            minutesUntilClose: null,
            opensAt: display.opensAt || '',
            closesAt: display.closesAt || ''
        };
    }

    const rules = parseAllRules(display.hours);
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const today = rangesForDay(rules, day);

    let minutesSinceOpen = null;
    let minutesUntilClose = null;

    for (const [from, to] of today) {
        const inRange = to > from
            ? minutes >= from && minutes < to
            : minutes >= from || minutes < to;
        if (!inRange) continue;

        if (to > from) {
            minutesSinceOpen = minutes - from;
            minutesUntilClose = to - minutes;
        } else if (minutes >= from) {
            minutesSinceOpen = minutes - from;
            minutesUntilClose = (24 * 60 - minutes) + to;
        } else {
            // po północy w overnight
            minutesSinceOpen = (24 * 60 - from) + minutes;
            minutesUntilClose = to - minutes;
        }
        break;
    }

    return {
        known: true,
        isOpen: true,
        minutesSinceOpen,
        minutesUntilClose,
        opensAt: '',
        closesAt: display.closesAt || ''
    };
}

export default {
    isOpenNow,
    getProducerOpenStatus,
    getOpeningHoursDisplay,
    getOpenTiming,
    normalizeOpeningHours
};
