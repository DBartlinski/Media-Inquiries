/**
 * Best-effort extraction of structured fields from free-text Description.
 * Handles multiple formatting styles observed in CSV data:
 *   **Outlet**: X,  News Agency: X,  **NewsOutlet**: X,  Outlet: X
 *   **Reporter**: X,  Reporter name: X
 *   **Subject**: X,  **Topic**: X,  **Query**: X
 *   **Source/SME**: X,  SME: X,  **Attribution**: X
 */

function extractField(text: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const match = text.match(re)
    if (match?.[1]) {
      return match[1]
        .replace(/\*{1,2}/g, '')  // strip leftover markdown bold markers
        .replace(/\s+/g, ' ')     // collapse whitespace
        .trim()
    }
  }
  return ''
}

const OUTLET_PATTERNS = [
  /\*{0,2}(?:News\s*(?:Agency|Outlet)|Outlet|NewsOutlet)\*{0,2}\s*:\s*\*{0,2}\s*(.+)/im,
]

const REPORTER_PATTERNS = [
  /\*{0,2}(?:Reporter(?:\s*name)?)\*{0,2}\s*:\s*\*{0,2}\s*(.+)/im,
]

const SUBJECT_PATTERNS = [
  /\*{0,2}(?:Subject|Topic)\*{0,2}\s*:\s*\*{0,2}\s*(.+)/im,
]

const SME_PATTERNS = [
  /\*{0,2}(?:Source\/?SME|SME|Attribution)\*{0,2}\s*:\s*\*{0,2}\s*(.+)/im,
]

function splitSme(raw: string): string[] {
  if (!raw) return []
  // Split on semicolons, " and ", or commas before "Dr."
  return raw
    .split(/\s*;\s*|\s+and\s+/i)
    .flatMap((s) => s.split(/,\s*(?=Dr\.)/i))
    .map((s) => s.trim())
    .filter(Boolean)
}

export interface ParsedDescriptionFields {
  newsOutlet: string
  reporter: string
  subject: string
  sourceSme: string[]
}

export function parseDescriptionFields(description: string): ParsedDescriptionFields {
  if (!description) {
    return { newsOutlet: '', reporter: '', subject: '', sourceSme: [] }
  }

  const newsOutlet = extractField(description, OUTLET_PATTERNS)
  const reporter = extractField(description, REPORTER_PATTERNS)
  const subject = extractField(description, SUBJECT_PATTERNS)
  const smeRaw = extractField(description, SME_PATTERNS)

  return {
    newsOutlet,
    reporter,
    subject,
    sourceSme: splitSme(smeRaw),
  }
}
