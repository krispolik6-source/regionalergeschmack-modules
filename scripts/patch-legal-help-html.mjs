/**
 * Jednorazowy patch: sekcje legal/help w index.html → data-i18n-legal / data-i18n-help
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const terms = `
                <section class="side-menu-detail" data-side-menu-view="terms" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-legal="termsTitle"></h3>
                    <article class="side-menu-legal">
                        <h4 data-i18n-legal="termsS1Title"></h4>
                        <p data-i18n-legal="termsS1Body"></p>
                        <h4 data-i18n-legal="termsS2Title"></h4>
                        <p data-i18n-legal="termsS2Body" data-i18n-html="true"></p>
                        <h4 data-i18n-legal="termsS3Title"></h4>
                        <p data-i18n-legal="termsS3Body"></p>
                        <h4 data-i18n-legal="termsS4Title"></h4>
                        <p data-i18n-legal="termsS4Body"></p>
                        <h4 data-i18n-legal="termsS5Title"></h4>
                        <p data-i18n-legal="termsS5Body"></p>
                        <h4 data-i18n-legal="termsS6Title"></h4>
                        <p data-i18n-legal="termsS6Body"></p>
                        <h4 data-i18n-legal="termsS7Title"></h4>
                        <p data-i18n-legal="termsS7P1"></p>
                        <p data-i18n-legal="termsS7P2Intro"></p>
                        <ul class="side-menu-help-list">
                            <li data-i18n-legal="termsS7Li1"></li>
                            <li data-i18n-legal="termsS7Li2"></li>
                            <li data-i18n-legal="termsS7Li3"></li>
                            <li data-i18n-legal="termsS7Li4"></li>
                        </ul>
                        <p data-i18n-legal="termsS7P3"></p>
                        <h4 data-i18n-legal="termsS8Title"></h4>
                        <p data-i18n-legal="termsS8P1"></p>
                        <p data-i18n-legal="termsS8P2"></p>
                        <p data-i18n-legal="termsS8P3"></p>
                        <h4 data-i18n-legal="termsS9Title"></h4>
                        <p data-i18n-legal="termsS9P1"></p>
                        <p data-i18n-legal="termsS9P2"></p>
                        <h4 data-i18n-legal="termsS10Title"></h4>
                        <p data-i18n-legal="termsS10P1"></p>
                        <p data-i18n-legal="termsS10P2"></p>
                        <p data-i18n-legal="termsS10P3"></p>
                    </article>
                </section>
`;

const privacy = `
                <section class="side-menu-detail" data-side-menu-view="privacy" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-legal="privacyTitle"></h3>
                    <p class="side-menu-detail-meta" data-i18n-legal="privacyUpdated"></p>
                    <article class="side-menu-legal">
                        <h4 data-i18n-legal="privacyS1Title"></h4>
                        <p data-i18n-legal="privacyS1Body" data-i18n-html="true"></p>
                        <h4 data-i18n-legal="privacyS2Title"></h4>
                        <p data-i18n-legal="privacyS2P1"></p>
                        <p data-i18n-legal="privacyS2P2"></p>
                        <ul class="side-menu-help-list">
                            <li data-i18n-legal="privacyS2Li1"></li>
                            <li data-i18n-legal="privacyS2Li2"></li>
                            <li data-i18n-legal="privacyS2Li3"></li>
                            <li data-i18n-legal="privacyS2Li4"></li>
                            <li data-i18n-legal="privacyS2Li5"></li>
                        </ul>
                        <h4 data-i18n-legal="privacyS3Title"></h4>
                        <p data-i18n-legal="privacyS3Intro"></p>
                        <ul class="side-menu-help-list">
                            <li data-i18n-legal="privacyS3Li1"></li>
                            <li data-i18n-legal="privacyS3Li2"></li>
                        </ul>
                        <h4 data-i18n-legal="privacyS4Title"></h4>
                        <p data-i18n-legal="privacyS4Intro"></p>
                        <ul class="side-menu-help-list">
                            <li data-i18n-legal="privacyS4Li1"></li>
                            <li data-i18n-legal="privacyS4Li2"></li>
                        </ul>
                        <p data-i18n-legal="privacyS4Note" data-i18n-html="true"></p>
                        <h4 data-i18n-legal="privacyS5Title"></h4>
                        <p data-i18n-legal="privacyS5Intro"></p>
                        <ul class="side-menu-help-list">
                            <li data-i18n-legal="privacyS5Li1"></li>
                            <li data-i18n-legal="privacyS5Li2"></li>
                            <li data-i18n-legal="privacyS5Li3"></li>
                            <li data-i18n-legal="privacyS5Li4"></li>
                            <li data-i18n-legal="privacyS5Li5"></li>
                            <li data-i18n-legal="privacyS5Li6"></li>
                            <li data-i18n-legal="privacyS5Li7"></li>
                        </ul>
                        <p data-i18n-legal="privacyS5Contact" data-i18n-html="true"></p>
                        <h4 data-i18n-legal="privacyS6Title"></h4>
                        <p data-i18n-legal="privacyS6Intro"></p>
                        <ul class="side-menu-help-list">
                            <li data-i18n-legal="privacyS6Li1"></li>
                            <li data-i18n-legal="privacyS6Li2"></li>
                        </ul>
                        <h4 data-i18n-legal="privacyS7Title"></h4>
                        <p data-i18n-legal="privacyS7Body"></p>
                        <h4 data-i18n-legal="privacyS8Title"></h4>
                        <p data-i18n-legal="privacyS8Body"></p>
                    </article>
                </section>
`;

const help = `
                <section class="side-menu-detail" data-side-menu-view="guide" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="guideTitle"></h3>
                    <h4 class="side-menu-detail-sub" data-i18n-help="guideMapTitle"></h4>
                    <ol class="side-menu-steps">
                        <li data-i18n-help="guideMap1" data-i18n-html="true"></li>
                        <li data-i18n-help="guideMap2" data-i18n-html="true"></li>
                        <li data-i18n-help="guideMap3" data-i18n-html="true"></li>
                    </ol>
                    <h4 class="side-menu-detail-sub" data-i18n-help="guideFavTitle"></h4>
                    <ol class="side-menu-steps">
                        <li data-i18n-help="guideFav1" data-i18n-html="true"></li>
                        <li data-i18n-help="guideFav2" data-i18n-html="true"></li>
                    </ol>
                    <h4 class="side-menu-detail-sub" data-i18n-help="guideContactTitle"></h4>
                    <ol class="side-menu-steps">
                        <li data-i18n-help="guideContact1" data-i18n-html="true"></li>
                        <li data-i18n-help="guideContact2" data-i18n-html="true"></li>
                    </ol>
                    <h4 class="side-menu-detail-sub" data-i18n-help="guideReviewsTitle"></h4>
                    <ol class="side-menu-steps">
                        <li data-i18n-help="guideReviews1" data-i18n-html="true"></li>
                        <li data-i18n-help="guideReviews2" data-i18n-html="true"></li>
                    </ol>
                </section>

                <section class="side-menu-detail" data-side-menu-view="download" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="downloadTitle"></h3>
                    <div class="side-menu-download-block">
                        <h4 data-i18n-help="downloadAndroidTitle"></h4>
                        <p data-i18n-help="downloadAndroidDesc"></p>
                        <a class="side-menu-download-btn" href="/downloads/app.apk" download data-i18n-help="downloadApk"></a>
                    </div>
                    <div class="side-menu-download-block">
                        <h4 data-i18n-help="downloadIosTitle"></h4>
                        <p data-i18n-help="downloadIosDesc"></p>
                        <ol class="side-menu-steps">
                            <li data-i18n-help="downloadIos1" data-i18n-html="true"></li>
                            <li data-i18n-help="downloadIos2" data-i18n-html="true"></li>
                        </ol>
                    </div>
                    <div class="side-menu-download-block">
                        <h4 data-i18n-help="downloadStoresTitle"></h4>
                        <p class="side-menu-detail-note" data-i18n-help="downloadStoresNote"></p>
                        <a class="side-menu-download-btn side-menu-store-btn" href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" data-i18n-help="downloadPlay"></a>
                        <a class="side-menu-download-btn side-menu-store-btn" href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" data-i18n-help="downloadAppStore"></a>
                    </div>
                </section>

                <section class="side-menu-detail" data-side-menu-view="qr" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="qrTitle"></h3>
                    <div class="side-menu-qr-block">
                        <img id="sideMenuQrImage" class="side-menu-qr-image" alt="" width="200" height="200">
                        <p class="side-menu-qr-caption" data-i18n-help="qrCaption"></p>
                    </div>
                    <p class="side-menu-detail-lead" data-i18n-help="qrLead"></p>
                </section>

                <section class="side-menu-detail" data-side-menu-view="recommendations" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="recTitle"></h3>
                    <p class="side-menu-detail-lead" data-i18n-help="recLead"></p>
                    <h4 class="side-menu-detail-sub" data-i18n-help="recDevicesTitle"></h4>
                    <ul class="side-menu-device-list">
                        <li data-i18n-help="recDevice1" data-i18n-html="true"></li>
                        <li data-i18n-help="recDevice2" data-i18n-html="true"></li>
                        <li data-i18n-help="recDevice3" data-i18n-html="true"></li>
                    </ul>
                    <h4 class="side-menu-detail-sub" data-i18n-help="recTipsTitle"></h4>
                    <ol class="side-menu-steps">
                        <li data-i18n-help="recTip1"></li>
                        <li data-i18n-help="recTip2"></li>
                        <li data-i18n-help="recTip3"></li>
                        <li data-i18n-help="recTip4"></li>
                    </ol>
                    <div class="side-menu-downloads">
                        <a class="side-menu-download-btn" href="/docs/instrukcja-instalacji.pdf" download data-i18n-help="recPdf"></a>
                        <a class="side-menu-download-btn" href="/downloads/app.apk" download data-i18n-help="recApk"></a>
                    </div>
                </section>

                <section class="side-menu-detail" data-side-menu-view="contact" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="contactTitle"></h3>
                    <ul class="side-menu-contact-list">
                        <li class="contact-item">
                            <span class="contact-avatar" aria-hidden="true">KP</span>
                            <span>Krzysztof Polikarski</span>
                        </li>
                        <li><span aria-hidden="true">📧</span> <a href="mailto:krispolik6@gmail.com">krispolik6@gmail.com</a></li>
                        <li><span aria-hidden="true">📍</span> Polikarski Krzysztof, Germany</li>
                    </ul>
                    <p class="side-menu-detail-lead" data-i18n-help="contactLead" data-i18n-html="true"></p>
                    <p class="side-menu-detail-lead" data-i18n-help="contactReply"></p>
                </section>

                <section class="side-menu-detail" data-side-menu-view="author" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="authorTitle"></h3>
                    <p class="side-menu-detail-lead"><strong>Krzysztof Polikarski</strong></p>
                    <p data-i18n-help="authorRole"></p>
                    <p class="side-menu-detail-meta" data-i18n-help="authorMeta"></p>
                </section>

                <section class="side-menu-detail" data-side-menu-view="cooperation" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="coopTitle"></h3>
                    <p class="side-menu-detail-lead" data-i18n-help="coopLead"></p>
                    <ul class="side-menu-help-list">
                        <li data-i18n-help="coopLi1"></li>
                        <li data-i18n-help="coopLi2"></li>
                        <li data-i18n-help="coopLi3"></li>
                    </ul>
                    <a class="side-menu-download-btn" href="mailto:krispolik6@gmail.com?subject=Cooperation" data-i18n-help="coopWrite"></a>
                </section>

                <section class="side-menu-detail" data-side-menu-view="report-bug" hidden>
                    <h3 class="side-menu-detail-title" data-i18n-help="bugTitle"></h3>
                    <p class="side-menu-detail-lead" data-i18n-help="bugLead"></p>
                    <ol class="side-menu-steps">
                        <li data-i18n-help="bug1"></li>
                        <li data-i18n-help="bug2"></li>
                        <li data-i18n-help="bug3"></li>
                    </ol>
                    <a class="side-menu-download-btn" href="mailto:krispolik6@gmail.com?subject=Bug%20report" data-i18n-help="bugSend"></a>
                </section>
`;

function replaceBetween(src, startMarker, endMarker, replacement) {
    const start = src.indexOf(startMarker);
    const end = src.indexOf(endMarker);
    if (start < 0 || end < 0 || end <= start) {
        throw new Error(`Markers not found: ${startMarker} → ${endMarker}`);
    }
    return src.slice(0, start) + replacement.trim() + '\n\n                ' + src.slice(end);
}

html = replaceBetween(
    html,
    '<section class="side-menu-detail" data-side-menu-view="terms"',
    '<section class="side-menu-detail" data-side-menu-view="privacy"',
    terms
);
html = replaceBetween(
    html,
    '<section class="side-menu-detail" data-side-menu-view="privacy"',
    '<section class="side-menu-detail" data-side-menu-view="about"',
    privacy
);
html = replaceBetween(
    html,
    '<section class="side-menu-detail" data-side-menu-view="guide"',
    '<section class="side-menu-detail" data-side-menu-view="feedback"',
    help
);

html = html.replace('aria-label="Share text"', 'aria-label="" data-i18n-aria="a11y.shareText"');
html = html.replace(
    'id="sideMenuShareOpenLink" href="https://admirable-cascaron-c76940.netlify.app" target="_blank" rel="noopener noreferrer">Open</a>',
    'id="sideMenuShareOpenLink" href="https://admirable-cascaron-c76940.netlify.app" target="_blank" rel="noopener noreferrer" data-i18n-testing="shareOpen">Open</a>'
);

fs.writeFileSync(file, html);
console.log('OK patched', file);
