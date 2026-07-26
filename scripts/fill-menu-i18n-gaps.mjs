/**
 * Uzupełnia MENU_I18N o tasteDiary / sectionDev / devVault (33 języki).
 * Usage: node scripts/fill-menu-i18n-gaps.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'js', 'translations-menu.js');

/** @type {Record<string, { tasteDiary: string, sectionDev: string, devVault: string }>} */
const EXTRA = {
    ru: { tasteDiary: 'Дневник вкуса', sectionDev: 'Разработчик', devVault: 'Панель разработчика' },
    tr: { tasteDiary: 'Tat günlüğü', sectionDev: 'Geliştirici', devVault: 'Geliştirici paneli' },
    fr: { tasteDiary: 'Journal des saveurs', sectionDev: 'Développeur', devVault: 'Panneau développeur' },
    es: { tasteDiary: 'Diario de sabores', sectionDev: 'Desarrollador', devVault: 'Panel de desarrollador' },
    it: { tasteDiary: 'Diario dei sapori', sectionDev: 'Sviluppatore', devVault: 'Pannello sviluppatore' },
    nl: { tasteDiary: 'Smaakdagboek', sectionDev: 'Ontwikkelaar', devVault: 'Ontwikkelaarspaneel' },
    cs: { tasteDiary: 'Deník chutí', sectionDev: 'Vývojář', devVault: 'Vývojářský panel' },
    sk: { tasteDiary: 'Denník chutí', sectionDev: 'Vývojár', devVault: 'Vývojársky panel' },
    hu: { tasteDiary: 'Íznapló', sectionDev: 'Fejlesztő', devVault: 'Fejlesztői panel' },
    ro: { tasteDiary: 'Jurnal de gusturi', sectionDev: 'Dezvoltator', devVault: 'Panou dezvoltator' },
    bg: { tasteDiary: 'Дневник на вкусовете', sectionDev: 'Разработчик', devVault: 'Панел за разработчици' },
    el: { tasteDiary: 'Ημερολόγιο γεύσεων', sectionDev: 'Προγραμματιστής', devVault: 'Πίνακας προγραμματιστή' },
    hr: { tasteDiary: 'Dnevnik okusa', sectionDev: 'Razvojni programer', devVault: 'Panel za razvoj' },
    sr: { tasteDiary: 'Дневник укуса', sectionDev: 'Програмер', devVault: 'Програмерски панел' },
    mk: { tasteDiary: 'Дневник на вкусови', sectionDev: 'Развивач', devVault: 'Панел за развивачи' },
    sl: { tasteDiary: 'Dnevnik okusov', sectionDev: 'Razvijalec', devVault: 'Razvijalski panel' },
    lt: { tasteDiary: 'Skonių dienoraštis', sectionDev: 'Kūrėjas', devVault: 'Kūrėjo skydelis' },
    lv: { tasteDiary: 'Garšu dienasgrāmata', sectionDev: 'Izstrādātājs', devVault: 'Izstrādātāja panelis' },
    et: { tasteDiary: 'Maitsedearuanne', sectionDev: 'Arendaja', devVault: 'Arendaja paneel' },
    fi: { tasteDiary: 'Makupäiväkirja', sectionDev: 'Kehittäjä', devVault: 'Kehittäjäpaneeli' },
    sv: { tasteDiary: 'Smakdagbok', sectionDev: 'Utvecklare', devVault: 'Utvecklarpanel' },
    no: { tasteDiary: 'Smaksdagbok', sectionDev: 'Utvikler', devVault: 'Utviklerpanel' },
    da: { tasteDiary: 'Smagdagbog', sectionDev: 'Udvikler', devVault: 'Udviklerpanel' },
    is: { tasteDiary: 'Bragðdagbók', sectionDev: 'Hönnuður', devVault: 'Hönnuðarspjald' },
    zh: { tasteDiary: '口味日记', sectionDev: '开发者', devVault: '开发者面板' },
    'zh-tw': { tasteDiary: '口味日記', sectionDev: '開發者', devVault: '開發者面板' },
    ja: { tasteDiary: '味わい日記', sectionDev: '開発者', devVault: '開発者パネル' },
    ko: { tasteDiary: '맛 일기', sectionDev: '개발자', devVault: '개발자 패널' },
    vi: { tasteDiary: 'Nhật ký hương vị', sectionDev: 'Nhà phát triển', devVault: 'Bảng nhà phát triển' },
    ms: { tasteDiary: 'Diari rasa', sectionDev: 'Pembangun', devVault: 'Panel pembangun' },
    id: { tasteDiary: 'Buku harian rasa', sectionDev: 'Pengembang', devVault: 'Panel pengembang' },
    th: { tasteDiary: 'ไดอารี่รสชาติ', sectionDev: 'นักพัฒนา', devVault: 'แผงนักพัฒนา' },
    hi: { tasteDiary: 'स्वाद डायरी', sectionDev: 'डेवलपर', devVault: 'डेवलपर पैनल' }
};

let src = readFileSync(FILE, 'utf8');
let patched = 0;

for (const [code, strings] of Object.entries(EXTRA)) {
    const key = code === 'zh-tw' ? "'zh-tw'" : code;
    // Find language block end: last property before closing `    },` of that lang
    // Insert before sectionTesting line if missing tasteDiary
    const re = new RegExp(
        `(${key}:\\s*\\{[\\s\\S]*?shareApp:\\s*'[^']*')(\\s*\\n\\s*\\},)`,
        'm'
    );
    const m = src.match(re);
    if (!m) {
        console.warn('skip (pattern)', code);
        continue;
    }
    if (m[0].includes('tasteDiary:')) {
        console.log('already', code);
        continue;
    }
    const insert = `${m[1]},\n        tasteDiary: '${strings.tasteDiary.replace(/'/g, "\\'")}',\n        sectionDev: '${strings.sectionDev.replace(/'/g, "\\'")}',\n        devVault: '${strings.devVault.replace(/'/g, "\\'")}'${m[2]}`;
    src = src.replace(re, insert);
    patched += 1;
    console.log('patched', code);
}

writeFileSync(FILE, src, 'utf8');
console.log(`Done · patched ${patched} languages`);
