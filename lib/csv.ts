/**
 * A small, correct CSV reader for the lead importer.
 *
 * No dependency for this: the file is one well-formed export from a known
 * scraper, and the parts of RFC 4180 that actually matter here are few. What
 * does matter, and what a `split(',')` gets wrong on the very first row of
 * `leads.csv`:
 *
 *   - Quoted fields containing commas. Every `address` and `pitch_angle` in
 *     the scrape has them: `"Shop 7, Murlidhar Nagar Rd, Nashik"` is one
 *     field, not three.
 *   - Doubled quotes as an escaped quote — `"Asrani""s Clinic"`. The scrape
 *     has apostrophes in names, and Excel writes them this way after a
 *     round-trip.
 *   - A UTF-8 BOM on the first header cell. `leads.csv` starts with one, which
 *     turns the first column name into `﻿name` and makes it miss a
 *     `name` lookup by exact match.
 *   - CRLF line endings, since this comes off Windows.
 */

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

/** Split one CSV document into rows of raw cells. */
function splitRecords(text: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  // Strip the BOM before anything else looks at the text.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        // `""` inside a quoted field is a literal quote.
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      // Consume CRLF as one break, not two.
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(cell);
      records.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  // Whatever is left when the text ends is the final cell, unless the file
  // ended on a newline and left nothing behind.
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    records.push(row);
  }

  return records;
}

/**
 * Parse CSV text into objects keyed by header name.
 *
 * Headers are lowercased and trimmed so `Lead Score`, `lead_score` and
 * `LEAD_SCORE` all land in the same place. Short rows are padded rather than
 * rejected — a trailing empty column is not worth failing an import over.
 */
export function parseCsv(text: string): ParsedCsv {
  const records = splitRecords(text).filter(
    // Drop blank lines, including the trailing one most exports end with.
    (record) => record.some((cell) => cell.trim() !== '')
  );

  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map((header) => header.trim().toLowerCase());

  const rows = records.slice(1).map((record) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (record[index] ?? '').trim();
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Column aliases, so a CSV that names things slightly differently still
 * imports. The left-hand side is what the app calls the field; the right is
 * every spelling seen in the wild, in priority order.
 *
 * `reviews` -> `review_count` is the one that matters for the current
 * scraper: the CSV column is `reviews`, the database column is `review_count`.
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  name: ['name', 'business_name', 'business', 'title'],
  phone: ['phone', 'phone_number', 'mobile', 'contact', 'number'],
  email: ['email', 'email_address', 'mail'],
  company: ['company', 'company_name'],
  city: ['city', 'location', 'area'],
  category: ['category', 'type', 'business_type'],
  niche: ['niche', 'segment'],
  address: ['address', 'full_address', 'street_address'],
  website: ['website', 'url', 'site', 'web'],
  maps_url: ['maps_url', 'map_url', 'google_maps', 'maps', 'gmaps_url', 'link'],
  pitch_angle: ['pitch_angle', 'pitch', 'angle', 'reason', 'notes'],
  lead_score: ['lead_score', 'score', 'priority_score'],
  rating: ['rating', 'stars', 'star_rating', 'google_rating'],
  review_count: ['review_count', 'reviews', 'num_reviews', 'total_reviews'],
};

export type MappedRow = Record<string, string>;

/**
 * Rename a parsed row's keys to the field names the import API expects,
 * dropping columns we have no use for (`lead_type` is scraper bookkeeping).
 */
export function mapRow(row: Record<string, string>): MappedRow {
  const mapped: MappedRow = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const match = aliases.find(
      (alias) => row[alias] !== undefined && row[alias] !== ''
    );
    if (match) mapped[field] = row[match];
  }

  return mapped;
}

/** Which of our fields this file supplies — used to preview the mapping. */
export function detectColumns(headers: string[]): Record<string, string | null> {
  const present = new Set(headers);
  const detected: Record<string, string | null> = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    detected[field] = aliases.find((alias) => present.has(alias)) ?? null;
  }

  return detected;
}
