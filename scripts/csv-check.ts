import { readFileSync } from 'node:fs';
import { parseCsv, mapRow, detectColumns } from '../lib/csv';

const text = readFileSync(
  String.raw`C:\Users\rohit\lead-finder\output\leads.csv`,
  'utf8'
);
const { headers, rows } = parseCsv(text);

console.log('headers:', headers);
console.log('row count:', rows.length);

console.log('\ndetected mapping:');
for (const [field, col] of Object.entries(detectColumns(headers))) {
  console.log(`  ${field.padEnd(13)} <- ${col ?? '(none)'}`);
}

console.log('\n--- row 1 mapped ---');
console.log(mapRow(rows[0]));

console.log('\n--- address integrity (commas inside quotes) ---');
console.log(JSON.stringify(rows[0].address));

console.log('\n--- rows lacking phone ---');
rows.forEach((r, i) => {
  const m = mapRow(r);
  if (!m.phone) console.log(`  row ${i + 1}: ${m.name} | has maps_url: ${Boolean(m.maps_url)}`);
});

console.log('\n--- field coverage ---');
const fields = [
  'name', 'phone', 'city', 'lead_score', 'rating',
  'review_count', 'maps_url', 'pitch_angle', 'website',
];
for (const f of fields) {
  const n = rows.filter((r) => mapRow(r)[f]).length;
  console.log(`  ${f.padEnd(13)} ${n}/${rows.length}`);
}

console.log('\n--- unmapped CSV columns ---');
const claimed = new Set(Object.values(detectColumns(headers)).filter(Boolean));
console.log(' ', headers.filter((h) => !claimed.has(h)));
