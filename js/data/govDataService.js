// js/data/govDataService.js – Hofläden NRW (WFS GeoJSON, bez CKAN – brak CORS w przeglądarce)

import { t } from '../core/i18n.js';

const WFS_BASE = 'https://geo.kreis-viersen.de/ows/osm-daten';
const FETCH_TIMEOUT_MS = 30000;

/** CKAN Open.NRW nie udostępnia ACAO – nie wywoływać z przeglądarki (tylko WFS). */
export const HOF_LAEDEN_PACKAGE_ID = '51263162-380a-4ec0-8b59-b524c10c0ebb';

function bboxFromCenter(lat, lng, radiusKm) {
    const radius = Number(radiusKm) || 10;
    const latDelta = radius / 111.32;
    const lngDelta = radius / (111.32 * Math.cos((lat * Math.PI) / 180));
    return {
        minLng: lng - lngDelta,
        minLat: lat - latDelta,
        maxLng: lng + lngDelta,
        maxLat: lat + latDelta
    };
}

function buildWfsGeoJsonUrl(lat, lng, radiusKm) {
    const { minLng, minLat, maxLng, maxLat } = bboxFromCenter(lat, lng, radiusKm);
    const params = new URLSearchParams({
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        VERSION: '1.1.0',
        TYPENAME: 'hoflaeden_nrw',
        SRSNAME: 'EPSG:4326',
        BBOX: `${minLng},${minLat},${maxLng},${maxLat},EPSG:4326`,
        outputFormat: 'GeoJSON'
    });
    return `${WFS_BASE}?${params.toString()}`;
}

function buildAddress(props = {}) {
    if (props.adresse) return String(props.adresse).trim();

    const parts = [
        [props.strasse || props.addr_street, props.hausnummer || props.addr_housenumber]
            .filter(Boolean)
            .join(' '),
        [props.plz || props.addr_postcode, props.ort || props.addr_city].filter(Boolean).join(' ')
    ].filter(Boolean);

    if (parts.length) return parts.join(', ');
    return '';
}

function featureToProducer(feature, index) {
    const props = feature.properties || {};
    const geometry = feature.geometry || {};
    let lat;
    let lng;

    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
        lng = Number(geometry.coordinates[0]);
        lat = Number(geometry.coordinates[1]);
    } else if (geometry.type === 'MultiPoint' && geometry.coordinates?.[0]) {
        lng = Number(geometry.coordinates[0][0]);
        lat = Number(geometry.coordinates[0][1]);
    } else {
        return null;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const name = String(props.name || props.bezeichnung || props.title || '').trim();
    if (!name) return null;

    const idSuffix = props.osm_id || props.id || index;

    return {
        id: `gov-hofladen-${idSuffix}`,
        name,
        category: 'farmer',
        chain: '',
        address: buildAddress(props),
        lat,
        lng,
        description: props.beschreibung || t('map.fallbackHofladen'),
        rating: null,
        promo: '',
        phone: props.telefon || props.phone || '',
        email: props.email || '',
        website: props.website || props.internet || props.url || '',
        products: [],
        source: 'govdata'
    };
}

/**
 * Metadane pakietu Hofläden z CKAN Open.NRW.
 * @param {string} [category]
 */
async function fetchWithTimeout(url, options = {}) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller
        ? setTimeout(() => controller.abort(), options.timeoutMs || FETCH_TIMEOUT_MS)
        : null;

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller?.signal,
            headers: {
                Accept: 'application/json',
                ...(options.headers || {})
            }
        });
        return response;
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error('GovData request timeout');
        }
        throw error;
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function fetchGovData(category = 'farmer', lat, lng, radiusKm = 10) {
    if (category && !['farmer', 'farmers', 'all'].includes(category)) {
        return [];
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return [];
    }

    try {
        const wfsUrl = buildWfsGeoJsonUrl(latitude, longitude, radiusKm);
        const geoRes = await fetchWithTimeout(wfsUrl);
        if (!geoRes.ok) {
            throw new Error(`WFS HTTP ${geoRes.status}`);
        }

        const geojson = await geoRes.json();
        const features = Array.isArray(geojson?.features) ? geojson.features : [];

        return features
            .map((feature, index) => featureToProducer(feature, index))
            .filter(Boolean);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.warn('[GovData] WFS fetch failed:', error);
        }
        throw error;
    }
}

export { fetchGovData };
