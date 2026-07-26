// js/presentation/seasonTheme.js – ETAP 11: motyw sezonowy na body (tylko prezentacja)
import { getCurrentSeason } from '../data/seasonCalendar.js';

const SEASON_CLASSES = ['season-spring', 'season-summer', 'season-autumn', 'season-winter'];

/**
 * Ustawia body.season-* + climate-ready na podstawie kalendarza.
 * Bez EventBus / Store – czysta prezentacja.
 */
export function initSeasonTheme(now = new Date()) {
    const body = document.body;
    if (!body) return getCurrentSeason(now);

    const season = getCurrentSeason(now);
    body.classList.remove(...SEASON_CLASSES);
    body.classList.add(`season-${season}`, 'climate-ready');
    body.dataset.season = season;
    return season;
}
