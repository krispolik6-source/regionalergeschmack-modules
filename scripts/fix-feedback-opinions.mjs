/**
 * Formularz Opinii: ikona 📝, pola imię/opinia/ocena 1–5, UTF-8.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'index.html');
let html = readFileSync(path, 'utf8');

// Ikona menu → 📝
html = html.replace(
    /(<li><button type="button" class="side-menu-item side-menu-item-highlight" data-side-menu-action="feedback"><span class="side-menu-item-icon" aria-hidden="true">)[^<]*(<\/span>)/,
    '$1📝$2'
);

const formBlock = `                <section class="side-menu-detail" data-side-menu-view="feedback" hidden>
                    <h3 class="side-menu-detail-title">📝 <span data-i18n-menu="feedback">Opinie</span></h3>
                    <p class="side-menu-detail-lead" data-i18n-testing="feedbackLead">Pomóż nam ulepszyć aplikację – dziękujemy za opinię!</p>
                    <form id="userFeedbackForm" class="side-menu-feedback-form" novalidate>
                        <label class="side-menu-field">
                            <span data-i18n-testing="feedbackName">Imię</span>
                            <input type="text" name="name" id="feedbackName" autocomplete="name" maxlength="80" required>
                        </label>
                        <label class="side-menu-field">
                            <span data-i18n-testing="feedbackOpinion">Twoja opinia</span>
                            <textarea name="opinion" id="feedbackOpinion" rows="4" maxlength="2000" required></textarea>
                        </label>
                        <fieldset class="side-menu-field side-menu-rating" data-feedback-rating>
                            <legend data-i18n-testing="feedbackRating">Ocena (1–5)</legend>
                            <div class="side-menu-rating-options" role="radiogroup" aria-label="Ocena">
                                <label class="side-menu-rating-option"><input type="radio" name="rating" value="1" required> 1</label>
                                <label class="side-menu-rating-option"><input type="radio" name="rating" value="2"> 2</label>
                                <label class="side-menu-rating-option"><input type="radio" name="rating" value="3"> 3</label>
                                <label class="side-menu-rating-option"><input type="radio" name="rating" value="4"> 4</label>
                                <label class="side-menu-rating-option"><input type="radio" name="rating" value="5"> 5</label>
                            </div>
                        </fieldset>
                        <label class="side-menu-field">
                            <span data-i18n-testing="feedbackDevice">Urządzenie</span>
                            <select name="device" id="feedbackDevice">
                                <option value="phone" data-i18n-testing-option="devicePhone">Telefon</option>
                                <option value="tablet" data-i18n-testing-option="deviceTablet">Tablet</option>
                                <option value="desktop" data-i18n-testing-option="deviceDesktop">Komputer</option>
                                <option value="other" data-i18n-testing-option="deviceOther">Inne</option>
                            </select>
                        </label>
                        <label class="side-menu-field">
                            <span data-i18n-testing="feedbackLanguage">Język</span>
                            <input type="text" name="language" id="feedbackLanguage" readonly>
                        </label>
                        <button type="submit" class="side-menu-download-btn" data-i18n-testing="feedbackSubmit">Wyślij opinię</button>
                    </form>
                    <p class="side-menu-detail-note" data-i18n-testing="feedbackStoredHint">Opinia zapisuje się lokalnie na tym urządzeniu.</p>
                </section>`;

html = html.replace(
    /<section class="side-menu-detail" data-side-menu-view="feedback" hidden>[\s\S]*?<\/section>/,
    formBlock
);

html = html.replace(/js\/app\.js\?v=\d+/, (m) => {
    const n = Number((/v=(\d+)/.exec(m) || [])[1] || 566) + 1;
    return `js/app.js?v=${n}`;
});
html = html.replace(/css\/style\.css\?v=\d+/, (m) => {
    const n = Number((/v=(\d+)/.exec(m) || [])[1] || 548) + 1;
    return `css/style.css?v=${n}`;
});

writeFileSync(path, html, 'utf8');
console.log('OK feedback form', {
    note: html.includes('📝'),
    rating: html.includes('name="rating"'),
    utf8: html.includes('Pomóż nam'),
    app: /app\.js\?v=(\d+)/.exec(html)?.[1]
});
