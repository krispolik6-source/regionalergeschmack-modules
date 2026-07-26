/**
 * ETAP 28D – Developer SMTP helper
 *
 * Credentials ONLY from env / .env (never committed).
 * Optional dependency: nodemailer (npm i nodemailer --save-dev).
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** Jedyny odbiorca raportów developerskich (właściciel projektu). */
export const OWNER_DEVELOPER_EMAIL = 'krispolik6@gmail.com';

/** Domyślny nadawca (wymaga zweryfikowanej domeny / SMTP z tym From). */
export const DEFAULT_SMTP_FROM =
    'Regionaler Geschmack <raporty@regionalergeschmack.com>';

/**
 * Nadawca raportu tygodniowego (zgodnie z prośbą właściciela).
 * Brand Book: oficjalna nazwa to „Regionaler Geschmack” — tu skrót „Regionaler Smak”.
 */
export const DEFAULT_SMTP_FROM_WEEKLY =
    'Regionaler Smak <raporty@regionalergeschmack.com>';

/**
 * Temat dzienny: Raport – Regionaler Geschmack [DATA]
 * @param {string} [day] YYYY-MM-DD
 */
export function mailSubjectForDay(day) {
    const d =
        day && /^\d{4}-\d{2}-\d{2}$/.test(String(day))
            ? String(day)
            : new Date().toISOString().slice(0, 10);
    return `Raport – Regionaler Geschmack ${d}`;
}

/**
 * Temat tygodniowy: Raport tygodniowy – Regionaler Smak [DATA]
 * @param {string} [day] YYYY-MM-DD
 */
export function weeklyMailSubject(day) {
    const d =
        day && /^\d{4}-\d{2}-\d{2}$/.test(String(day))
            ? String(day)
            : new Date().toISOString().slice(0, 10);
    return `Raport tygodniowy – Regionaler Smak ${d}`;
}

/**
 * Temat auto-naprawy: Auto-naprawa – Regionaler Smak [DATA]
 * @param {string} [day] YYYY-MM-DD
 */
export function selfHealMailSubject(day) {
    const d =
        day && /^\d{4}-\d{2}-\d{2}$/.test(String(day))
            ? String(day)
            : new Date().toISOString().slice(0, 10);
    return `Auto-naprawa – Regionaler Smak ${d}`;
}

/**
 * Temat raportu nocnego: Raport nocny – Regionaler Smak [DATA]
 * @param {string} [day] YYYY-MM-DD
 */
export function nightlyMailSubject(day) {
    const d =
        day && /^\d{4}-\d{2}-\d{2}$/.test(String(day))
            ? String(day)
            : new Date().toISOString().slice(0, 10);
    return `Raport nocny – Regionaler Smak ${d}`;
}

/** @deprecated użyj mailSubjectForDay(day) */
export const MAIL_SUBJECT = mailSubjectForDay();

/** Domyślny From dla resolveMailConfig gdy brak SMTP_FROM – tygodniowy wariant przez env. */
export function defaultFromForMode(mode = 'daily') {
    return mode === 'weekly' ? DEFAULT_SMTP_FROM_WEEKLY : DEFAULT_SMTP_FROM;
}

/**
 * @param {Record<string, string>} env
 */
export function resolveMailConfig(env = process.env) {
    const to = (env.DEVELOPER_REPORT_EMAIL || OWNER_DEVELOPER_EMAIL).trim();
    const host = (env.SMTP_HOST || '').trim();
    const port = Number(env.SMTP_PORT || 587);
    const user = (env.SMTP_USER || '').trim();
    const pass = (env.SMTP_PASS || env.SMTP_PASSWORD || '').trim();
    const from = (env.SMTP_FROM || DEFAULT_SMTP_FROM || user || '').trim();
    const secure =
        String(env.SMTP_SECURE || '').toLowerCase() === 'true' ||
        port === 465;
    const sendFlag =
        String(env.DEVELOPER_MAIL_SEND || '').trim() === '1' ||
        String(env.DEVELOPER_MAIL_SEND || '').toLowerCase() === 'true';

    return {
        to,
        host,
        port,
        user,
        pass,
        from,
        secure,
        sendFlag,
        configured: Boolean(host && user && pass && from && to.includes('@'))
    };
}

export function loadNodemailer() {
    try {
        return require('nodemailer');
    } catch {
        return null;
    }
}

/**
 * Zwykły e-mail: treść w body (text/plain). Bez HTML, bez załączników.
 * @param {{ subject: string, text: string }} payload
 * @param {Record<string, string>} env
 */
export async function sendDeveloperMail(payload, env = process.env) {
    const cfg = resolveMailConfig(env);
    const requested = (env.DEVELOPER_REPORT_EMAIL || '').trim();

    // Force owner-only: never send to end users / arbitrary addresses
    if (requested && requested !== OWNER_DEVELOPER_EMAIL) {
        return {
            ok: false,
            skipped: true,
            reason: `recipient_blocked: only owner ${OWNER_DEVELOPER_EMAIL} allowed`
        };
    }

    const to = OWNER_DEVELOPER_EMAIL;

    if (!cfg.sendFlag) {
        return {
            ok: false,
            skipped: true,
            reason: 'DEVELOPER_MAIL_SEND not enabled (set to 1)',
            to
        };
    }

    if (!cfg.configured) {
        return {
            ok: false,
            skipped: true,
            reason: 'SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_FROM)',
            to,
            setupDoc: 'docs/daily/DEVELOPER-MAIL.md'
        };
    }

    const nodemailer = loadNodemailer();
    if (!nodemailer) {
        return {
            ok: false,
            skipped: true,
            reason: 'nodemailer not installed — run: npm i nodemailer --save-dev',
            to,
            setupDoc: 'docs/daily/DEVELOPER-MAIL.md'
        };
    }

    const text = String(payload.text || '').trim();
    if (!text) {
        return {
            ok: false,
            skipped: true,
            reason: 'empty plain-text body',
            to
        };
    }

    const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: {
            user: cfg.user,
            pass: cfg.pass
        }
    });

    // Tylko text/plain w treści — nodemailer (bez html / attachments)
    const info = await transporter.sendMail({
        from: cfg.from,
        to,
        subject: payload.subject || mailSubjectForDay(),
        text
    });

    return {
        ok: true,
        skipped: false,
        to,
        from: cfg.from,
        format: 'text/plain',
        attachments: false,
        messageId: info.messageId || null,
        response: info.response || null
    };
}
