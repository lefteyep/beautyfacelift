// Lead sheet for the combo campaign (campaign plan, section 3.6). Usage: node make-lead-sheet.mjs <out.xlsx>
// Needs exceljs on NODE_PATH (npx -y -p exceljs ...). Excel/Google Sheets recalculate the formulas on open.
import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const out = process.argv[2];
mkdirSync(dirname(out), { recursive: true });
const FONT = 'Arial';
const STATUS = ['neu', 'kontaktiert', 'gebucht', 'erschienen', 'no-show', 'abgesagt', 'nicht erreicht'];
const HAUTZIEL = ['Glow', 'Poren', 'Hautstruktur', 'Trockenheit', 'Frischer aussehen', 'Ich bin unsicher'];
const grey = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } };
const yellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
const dark = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1A17' } };
const thin = { style: 'thin', color: { argb: 'FFBFBFBF' } };
const border = { top: thin, left: thin, bottom: thin, right: thin };
const f = (o = {}) => ({ name: FONT, size: 10, ...o });

const wb = new ExcelJS.Workbook();
wb.calcProperties.fullCalcOnLoad = true;
const ws = wb.addWorksheet('Leads', { views: [{ state: 'frozen', ySplit: 4 }] });
const cols = [
  ['Datum/Zeit der Anfrage', 20, 'Agentur'], ['Name', 22, 'Agentur'], ['Telefon', 18, 'Agentur'], ['E-Mail', 26, 'Agentur'],
  ['Hautziel', 18, 'Agentur'], ['utm_content (Anzeigengruppe__Anzeige)', 34, 'Agentur'], ['utm_term (Platzierung)', 22, 'Agentur'],
  ['Erster Kontakt (Datum/Zeit)', 22, 'Teresa'], ['Status', 16, 'Teresa'], ['Termin-Datum', 14, 'Teresa'],
  ['Umsatz erster Besuch (CHF)', 20, 'Teresa'], ['Folgetermin gebucht?', 18, 'Teresa'], ['Notiz', 40, 'beide'],
];
ws.getCell('A1').value = 'Kombi-Leads 2026-Q4 — Aquafacial + Microneedling (CHF 170)';
ws.getCell('A1').font = f({ bold: true, size: 14 });
ws.getCell('A2').value = 'Grau = Agentur füllt aus der Anfrage-E-Mail aus. Gelb = Teresa füllt aus. Eine Zeile pro Anfrage.';
ws.getCell('A2').font = f({ color: { argb: 'FF555555' } });
const HEADER = 4, FIRST = 5, LAST = 304;
cols.forEach(([name, width, who], i) => {
  const col = ws.getColumn(i + 1);
  col.width = width;
  const w = ws.getCell(HEADER - 1, i + 1);
  w.value = who; w.font = f({ size: 9, color: { argb: 'FF555555' } }); w.fill = who === 'Teresa' ? yellow : grey; w.alignment = { horizontal: 'center' };
  const h = ws.getCell(HEADER, i + 1);
  h.value = name; h.font = f({ bold: true, color: { argb: 'FFFFFFFF' } }); h.fill = dark; h.border = border; h.alignment = { wrapText: true, vertical: 'middle' };
});
ws.getRow(HEADER).height = 32;
for (let r = FIRST; r <= LAST; r++) {
  cols.forEach(([, , who], i) => {
    const c = ws.getCell(r, i + 1);
    c.font = f(); c.border = border; c.fill = who === 'Teresa' ? yellow : grey;
  });
  ws.getCell(r, 1).numFmt = 'DD.MM.YYYY HH:MM';
  ws.getCell(r, 8).numFmt = 'DD.MM.YYYY HH:MM';
  ws.getCell(r, 10).numFmt = 'DD.MM.YYYY';
  ws.getCell(r, 11).numFmt = '#,##0 "CHF"';
  ws.getCell(r, 9).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${STATUS.join(',')}"`], showErrorMessage: true, errorTitle: 'Status', error: 'Bitte einen Status aus der Liste wählen.' };
  ws.getCell(r, 5).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${HAUTZIEL.join(',')}"`] };
  ws.getCell(r, 12).dataValidation = { type: 'list', allowBlank: true, formulae: ['"ja,nein"'] };
}
// Example row: invented values, marked as such.
const ex = [new Date(2026, 9, 22, 9, 41), 'Beispiel Kundin', '079 000 00 00', 'beispiel@example.ch', 'Glow',
  'p_zh15km_adv__glow_static45_v1', 'Instagram_Stories', new Date(2026, 9, 22, 10, 5), 'gebucht', new Date(2026, 9, 29), 170, 'ja',
  'BEISPIELZEILE mit erfundenen Werten – beim ersten echten Lead überschreiben'];
ex.forEach((v, i) => { ws.getCell(FIRST, i + 1).value = v; });
ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: LAST, column: cols.length } };

const sm = wb.addWorksheet('Auswertung');
sm.getColumn(1).width = 58; sm.getColumn(2).width = 14; sm.getColumn(3).width = 12;
sm.getCell('A1').value = 'Auswertung (rechnet automatisch aus dem Blatt „Leads“)';
sm.getCell('A1').font = f({ bold: true, size: 14 });
const head = (r, labels) => labels.forEach((t, i) => { const c = sm.getCell(r, i + 1); c.value = t; c.font = f({ bold: true, color: { argb: 'FFFFFFFF' } }); c.fill = dark; });
head(3, ['Status', 'Anzahl']);
const RNG = `Leads!$I$${FIRST}:$I$${LAST}`;
STATUS.forEach((s, k) => {
  sm.getCell(4 + k, 1).value = s; sm.getCell(4 + k, 1).font = f();
  sm.getCell(4 + k, 2).value = { formula: `COUNTIF(${RNG},"${s}")` }; sm.getCell(4 + k, 2).font = f();
});
let row = 4 + STATUS.length;
const line = (label, formula, fmt) => { const a = sm.getCell(row, 1); a.value = label; a.font = f(); const b = sm.getCell(row, 2); b.value = { formula }; b.font = f(); if (fmt) b.numFmt = fmt; row++; };
line('Anfragen gesamt', `COUNTA(Leads!$A$${FIRST}:$A$${LAST})`);
line('Buchungsquote (gebucht+erschienen+no-show ÷ Anfragen)', `IFERROR((COUNTIF(${RNG},"gebucht")+COUNTIF(${RNG},"erschienen")+COUNTIF(${RNG},"no-show"))/B${row - 1},0)`, '0.0%');
line('Erscheinensquote (erschienen ÷ erschienen+no-show)', `IFERROR(COUNTIF(${RNG},"erschienen")/(COUNTIF(${RNG},"erschienen")+COUNTIF(${RNG},"no-show")),0)`, '0.0%');
line('Umsatz erster Besuch gesamt (CHF)', `SUM(Leads!$K$${FIRST}:$K$${LAST})`, '#,##0 "CHF"');
row++;
sm.getCell(row, 1).value = 'Anfragen je Anzeige (utm_content)'; sm.getCell(row, 1).font = f({ bold: true }); row++;
head(row, ['utm_content', 'Anfragen', 'gebucht']); row++;
for (let k = 0; k < 8; k++) {
  const r = row + k;
  const a = sm.getCell(r, 1); a.fill = grey; a.font = f(); a.border = border;
  sm.getCell(r, 2).value = { formula: `IF(A${r}="","",COUNTIF(Leads!$F$${FIRST}:$F$${LAST},A${r}))` }; sm.getCell(r, 2).font = f();
  sm.getCell(r, 3).value = { formula: `IF(A${r}="","",COUNTIFS(Leads!$F$${FIRST}:$F$${LAST},A${r},${RNG},"gebucht")+COUNTIFS(Leads!$F$${FIRST}:$F$${LAST},A${r},${RNG},"erschienen"))` }; sm.getCell(r, 3).font = f();
}
sm.getCell(row, 1).value = 'p_zh15km_adv__glow_static45_v1';
sm.getCell(row + 8, 1).value = 'Graue Zellen: Anzeigennamen eintragen (Anzeigengruppe__Anzeige, wie in der E-Mail-Zeile „UTM Content“).';
sm.getCell(row + 8, 1).font = f({ size: 9, color: { argb: 'FF555555' } });

const info = wb.addWorksheet('Anleitung');
info.getColumn(1).width = 120;
[
  ['So funktioniert das Blatt', true],
  ['', false],
  ['1. Jede Anfrage über die Aktionsseite kommt als E-Mail „Neue Kombi-Anfrage: Aquafacial + Microneedling – Name“ bei Ihnen an, die Agentur in Blindkopie.', false],
  ['2. Die Agentur trägt innerhalb eines Werktags die grauen Spalten ein (Datum, Name, Telefon, E-Mail, Hautziel, Anzeige).', false],
  ['3. Sie füllen nur die gelben Spalten: wann Sie die Person zuerst erreicht haben, den Status, den Termin, den Umsatz des ersten Besuchs, ob ein Folgetermin gebucht wurde, und eine Notiz.', false],
  ['', false],
  ['Status (Liste in der Zelle):', true],
  ['neu → noch nicht kontaktiert', false],
  ['kontaktiert → erreicht, noch kein Termin', false],
  ['gebucht → Termin vereinbart', false],
  ['erschienen → Termin hat stattgefunden', false],
  ['no-show → nicht erschienen', false],
  ['abgesagt → Termin abgesagt', false],
  ['nicht erreicht → nach drei Versuchen an drei Tagen nicht erreicht', false],
  ['', false],
  ['Ablauf, der sich bewährt:', true],
  ['Innerhalb etwa einer Stunde per WhatsApp oder Telefon antworten. Drei Versuche an drei Tagen. Termin schriftlich bestätigen, am Vortag erinnern.', false],
  ['WhatsApp-Anfragen aus der Werbung erzeugen keine E-Mail: bitte selbst als Zeile eintragen und in der Notiz „WhatsApp“ vermerken.', false],
  ['', false],
  ['Das Blatt „Auswertung“ rechnet automatisch: Anzahl je Status, Buchungsquote, Erscheinensquote, Umsatz und Anfragen je Anzeige.', false],
  ['Die erste Zeile im Blatt „Leads“ ist ein Beispiel mit erfundenen Werten und wird beim ersten echten Lead überschrieben.', false],
].forEach(([t, bold], i) => { const c = info.getCell(i + 1, 1); c.value = t; c.font = f({ bold, size: i === 0 ? 12 : 10 }); c.alignment = { wrapText: true, vertical: 'top' }; });

await wb.xlsx.writeFile(out);
console.log('written', out);
