/**
 * A deliberately tiny markdown subset for grammar notes: **bold** and *italic*.
 *
 * The grammar notes lean on emphasis constantly — Spanish forms are italicised
 * (*sedere*, *estar*) and the rule itself is bolded — so a parser that handles
 * only one of the two leaves literal asterisks scattered through the explanation.
 *
 * All content is authored in this repository, so there is no untrusted input and
 * nothing to sanitise; the output is React nodes, never HTML strings.
 */

export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string };

// Bold must be tried before italic, or `**x**` matches as an empty italic.
const PATTERN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;

export function parseRich(input: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;

  for (const match of input.matchAll(PATTERN)) {
    const at = match.index;
    if (at > last) out.push({ kind: 'text', text: input.slice(last, at) });

    const token = match[0];
    if (token.startsWith('**')) {
      out.push({ kind: 'bold', text: token.slice(2, -2) });
    } else {
      out.push({ kind: 'italic', text: token.slice(1, -1) });
    }
    last = at + token.length;
  }

  if (last < input.length) out.push({ kind: 'text', text: input.slice(last) });
  return out;
}

/** True if any asterisk would survive parsing and be shown to the reader. */
export function hasStrayMarkers(input: string): boolean {
  return parseRich(input).some((s) => s.kind === 'text' && s.text.includes('*'));
}
