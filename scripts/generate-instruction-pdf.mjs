/**
 * Generuje prostą instrukcję PDF dla starych tabletów.
 * Run: node scripts/generate-instruction-pdf.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'docs', 'instrukcja-instalacji.pdf');

const lines = [
  'Regionaler Geschmack - Instrukcja instalacji',
  '',
  'iPad A1416 / A1432 (iOS 9):',
  '1. Otworz Safari i wejdz na strone aplikacji.',
  '2. Kliknij Udostepnij.',
  '3. Wybierz Dodaj do ekranu poczatkowego.',
  '4. Uruchom skrot w trybie pelnoekranowym.',
  '',
  'Android 4.4+:',
  '1. Pobierz plik app.apk z /downloads/app.apk',
  '2. Wlacz Zrodla nieznane w ustawieniach.',
  '3. Zainstaluj APK i uruchom aplikacje.',
  '',
  'Wiecej: regionalergeschmack.local'
];

function escapePdfText(str) {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(textLines) {
  const contentLines = ['BT', '/F1 11 Tf', '50 750 Td', '14 TL'];
  textLines.forEach((line, index) => {
    if (index > 0) contentLines.push('T*');
    contentLines.push(`(${escapePdfText(line)}) Tj`);
  });
  contentLines.push('ET');
  const stream = contentLines.join('\n');
  const streamLen = Buffer.byteLength(stream, 'utf8');

  const objects = [
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj',
    `4 0 obj<< /Length ${streamLen} >>stream\n${stream}\nendstream\nendobj`,
    '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj + '\n';
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buildPdf(lines), 'utf8');
console.log('OK', outPath);
