/**
 * Generates the Spanish audio for the whole curriculum using ElevenLabs.
 *
 * Run it yourself, with your own key — the key is read from the environment and
 * is never written to disk, never committed, and never passed through anything
 * but the request to ElevenLabs:
 *
 *   export ELEVENLABS_API_KEY=...
 *   npm run audio            # generate everything missing
 *   npm run audio -- --dry   # count clips and characters, generate nothing
 *   npm run audio -- --limit 10   # try ten first, to hear the voice
 *
 * Resumable by design: it skips any clip already on disk, so an interrupted run
 * costs nothing to restart, and adding a card later only generates the new one.
 *
 * Output lands in public/audio/, which Vite copies into the build verbatim.
 */
import { mkdir, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'audio');

const { units, lexItems, sentences } = await import(join(ROOT, 'src/content/index.ts'));
const { audioKey } = await import(join(ROOT, 'src/lib/audioKey.ts'));

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};

const DRY = has('--dry');
const LIMIT = Number(valueOf('--limit', '0')) || 0;
const FORCE = has('--force');

/**
 * Voice and model.
 *
 * eleven_multilingual_v2 is the quality tier rather than the fast one: this is a
 * one-off batch that gets cached forever, so latency is irrelevant and fidelity
 * is the whole point. Override the voice with ELEVENLABS_VOICE_ID once you have
 * picked one you like from your account.
 */
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
// Default is "Sarah" — a clear, neutral voice. Any Spanish-capable voice from
// your account works; multilingual v2 speaks Spanish with whatever voice you give it.
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL';

/** Every distinct line of Spanish the app can speak, de-duplicated by content. */
function collectLines() {
  const seen = new Map();
  const add = (text, source) => {
    if (!text || !text.trim()) return;
    const key = audioKey(text);
    if (!seen.has(key)) seen.set(key, { key, text: text.trim(), sources: [source] });
    else seen.get(key).sources.push(source);
  };

  for (const item of lexItems()) add(item.es, `item ${item.id}`);
  for (const s of sentences()) add(s.es, `sentence ${s.id}`);
  for (const u of units) {
    for (const g of u.grammar) {
      for (const ex of g.examples) add(ex.es, `example ${g.id}`);
    }
    for (const p of u.pron?.pairs ?? []) {
      add(p.a, `pair ${u.pron.id}`);
      add(p.b, `pair ${u.pron.id}`);
    }
  }
  return [...seen.values()];
}

const lines = collectLines();
const chars = lines.reduce((n, l) => n + l.text.length, 0);

await mkdir(OUT, { recursive: true });
const existing = new Set(
  (await readdir(OUT).catch(() => [])).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)),
);

const todo = (FORCE ? lines : lines.filter((l) => !existing.has(l.key))).slice(
  0,
  LIMIT > 0 ? LIMIT : undefined,
);
const todoChars = todo.reduce((n, l) => n + l.text.length, 0);

// Files on disk that no longer correspond to any line — usually because the
// Spanish of a card was edited. Reported, never deleted automatically.
const wanted = new Set(lines.map((l) => l.key));
const orphans = [...existing].filter((k) => !wanted.has(k));

console.log(`Curriculum:  ${lines.length} distinct lines, ${chars.toLocaleString()} characters`);
console.log(`On disk:     ${existing.size} clips`);
console.log(`To generate: ${todo.length} clips, ${todoChars.toLocaleString()} characters`);
if (orphans.length > 0) {
  console.log(`Orphaned:    ${orphans.length} clips no longer referenced (safe to delete):`);
  for (const o of orphans.slice(0, 10)) console.log(`             public/audio/${o}.mp3`);
}

/** The manifest the app fetches to know which clips exist. */
async function writeManifest() {
  const onDisk = (await readdir(OUT).catch(() => []))
    .filter((f) => f.endsWith('.mp3'))
    .map((f) => f.slice(0, -4));
  await writeFile(
    join(OUT, 'manifest.json'),
    JSON.stringify({ generated: onDisk.length, keys: onDisk.sort() }),
  );
  console.log(`\nWrote public/audio/manifest.json (${onDisk.length} clips)`);
}

if (DRY) {
  console.log('\n--dry: nothing generated.');
  await writeManifest();
  process.exit(0);
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error(
    '\nELEVENLABS_API_KEY is not set.\n' +
      '  export ELEVENLABS_API_KEY=your-key-here\n' +
      'Use --dry to see the size of the job without a key.',
  );
  process.exit(1);
}

if (todo.length === 0) {
  console.log('\nNothing to do — every clip is already on disk.');
  await writeManifest();
  process.exit(0);
}

async function generate(line, attempt = 1) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_64`,
    {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        text: line.text,
        model_id: MODEL,
        language_code: 'es',
        // Higher stability and low style keep a teaching voice even and
        // repeatable; expressive delivery is wrong for a reference recording
        // that will be heard fifty times.
        voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
      }),
    },
  );

  if (res.status === 429 || res.status >= 500) {
    if (attempt > 4) throw new Error(`${res.status} after ${attempt} attempts`);
    const wait = 2 ** attempt * 1000;
    console.log(`    ${res.status} — retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
    return generate(line, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 512) throw new Error(`suspiciously small response (${buf.length} bytes)`);
  await writeFile(join(OUT, `${line.key}.mp3`), buf);
  return buf.length;
}

console.log(`\nVoice ${VOICE}, model ${MODEL}\n`);
let done = 0;
let bytes = 0;
const failures = [];

for (const line of todo) {
  const n = `${String(++done).padStart(String(todo.length).length)}/${todo.length}`;
  try {
    const size = await generate(line);
    bytes += size;
    console.log(`  ${n}  ${(size / 1024).toFixed(0).padStart(3)}KB  ${line.text}`);
  } catch (err) {
    failures.push({ line, message: String(err.message ?? err) });
    console.error(`  ${n}  FAILED  ${line.text} — ${err.message ?? err}`);
  }
  // Gentle on the API; this is a background batch, not a latency-sensitive path.
  await new Promise((r) => setTimeout(r, 120));
}

await writeManifest();

console.log(
  `\nGenerated ${done - failures.length}/${todo.length} clips, ${(bytes / 1024 / 1024).toFixed(1)}MB`,
);
if (failures.length > 0) {
  console.log(`${failures.length} failed. Re-run to retry only those.`);
  process.exitCode = 1;
}
