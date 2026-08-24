/**
 * End-to-end smoke test against the built app in a real browser.
 *
 * Unit tests cover the scheduler and the content; this covers the thing they
 * cannot — that a person can actually open the app, work through a session, and
 * have their progress still be there afterwards.
 *
 *   npm run build && node scripts/smoke.mjs [--shots]
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SHOTS = process.argv.includes('--shots');
const PORT = 4173;

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]));
    const file = path === '/' || path.endsWith('/') ? '/index.html' : path;
    const body = await readFile(join(ROOT, file));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

const fail = (message) => {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
};
const pass = (message) => console.log(`ok    ${message}`);

await new Promise((r) => server.listen(PORT, r));

// The pinned browser build lives under a versioned directory; find it rather than
// hard-coding a revision that will drift.
const { globSync } = await import('node:fs');
const [chromePath] = globSync('/opt/pw-browsers/chromium-*/chrome-linux/chrome');
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone-ish, which is where this runs
  deviceScaleFactor: 2,
});
const page = await context.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

try {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

  // --- home ---------------------------------------------------------------
  await page.getByRole('tab', { name: 'Today' }).waitFor({ timeout: 5000 });
  pass('app boots');

  const todayText = await page.locator('.card').first().innerText();
  if (!/6 items/.test(todayText)) fail(`expected 6 new items for a fresh learner, got: ${todayText}`);
  else pass('fresh learner is offered exactly one day of new material');

  if (SHOTS) await page.screenshot({ path: '/tmp/hablo-home.png' });

  // --- session ------------------------------------------------------------
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByText('New', { exact: true }).waitFor({ timeout: 5000 });

  const firstPrompt = await page.locator('.prompt-es').first().innerText();
  if (firstPrompt !== 'hola') fail(`expected the course to open on "hola", got "${firstPrompt}"`);
  else pass('curriculum starts at the beginning');

  if (SHOTS) await page.screenshot({ path: '/tmp/hablo-teach.png' });

  // Work through the whole session, answering every prompt correctly.
  let answered = 0;
  for (let step = 0; step < 80; step++) {
    if (await page.getByRole('button', { name: 'See what that unlocked' }).isVisible()) break;

    const check = page.getByRole('button', { name: 'Got it — check me' });
    if (await check.isVisible()) {
      await check.click();
      continue;
    }

    const cont = page.getByRole('button', { name: 'Continue' });
    if (await cont.isVisible()) {
      await cont.click();
      answered++;
      continue;
    }

    // Multiple choice: click the option matching the English gloss on screen.
    const choices = page.locator('.choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
      continue;
    }

    const input = page.locator('input[type="text"]');
    if (await input.isVisible()) {
      await page.getByRole('button', { name: /I don't know/ }).click();
      continue;
    }
    break;
  }

  if (answered < 6) fail(`expected to answer at least 6 prompts, answered ${answered}`);
  else pass(`worked through a full session (${answered} prompts)`);

  if (SHOTS) await page.screenshot({ path: '/tmp/hablo-session.png' });

  // --- completion ---------------------------------------------------------
  const unlocked = page.getByRole('button', { name: 'See what that unlocked' });
  if (!(await unlocked.isVisible())) fail('never reached the end-of-session screen');
  else {
    await unlocked.click();
    const summary = await page.locator('.card').first().innerText();
    if (!/Session done/.test(summary)) fail('completion screen did not render');
    else pass('completion screen reports the session');
    if (SHOTS) await page.screenshot({ path: '/tmp/hablo-complete.png' });
    await page.getByRole('button', { name: 'Done' }).click();
  }

  // --- progress persisted -------------------------------------------------
  await page.getByRole('tab', { name: 'Progress' }).click();
  const progressText = await page.locator('.stat-grid').first().innerText();
  if (!/[1-9]\d*\s*\n?\s*items in memory/.test(progressText.replace(/\s+/g, ' ').replace(/(\d+) /, '$1\n')))
    console.log(`      progress panel: ${progressText.replace(/\s+/g, ' ')}`);
  const inMemory = Number(progressText.match(/(\d+)\s*items in memory/)?.[1] ?? '0');
  if (inMemory < 6) fail(`expected 6+ items in memory, saw ${inMemory}`);
  else pass(`progress recorded (${inMemory} items in memory)`);
  if (SHOTS) await page.screenshot({ path: '/tmp/hablo-progress.png' });

  // --- reference ----------------------------------------------------------
  await page.getByRole('tab', { name: 'Guide' }).click();
  await page.getByText('Lifelines').first().waitFor({ timeout: 5000 });
  const refText = await page.locator('.app').innerText();
  for (const phrase of ['no entiendo', 'más despacio, por favor', '¿cómo se dice...?']) {
    if (!refText.includes(phrase)) fail(`lifeline missing from reference: ${phrase}`);
  }
  pass('lifelines are reachable from day one');

  const note = page.locator('details', {
    has: page.getByText('ser vs estar — the one that actually matters'),
  });
  if ((await note.count()) === 0) fail('grammar notes not reachable');
  else {
    await note.locator('summary').click();
    await note.getByText('sedere', { exact: false }).first().waitFor({ timeout: 3000 });
    const body = await note.innerText();
    if (body.includes('*')) fail(`emphasis markers leaked into the rendered note: ${body.slice(0, 120)}`);
    else pass('grammar notes render etymology without stray markers');
  }
  if (SHOTS) await page.screenshot({ path: '/tmp/hablo-reference.png', fullPage: false });

  // --- reload keeps state -------------------------------------------------
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'Progress' }).click();
  const after = await page.locator('.stat-grid').first().innerText();
  const stillThere = Number(after.match(/(\d+)\s*items in memory/)?.[1] ?? '0');
  if (stillThere !== inMemory) fail(`progress lost on reload: ${inMemory} -> ${stillThere}`);
  else pass('progress survives a reload');

  // --- returning learner --------------------------------------------------
  // Day one is all teach screens, so the typed-production path — the exercise the
  // whole design argument rests on — would otherwise never be exercised in a real
  // browser. Seed a set of due, already-introduced cards and run a second session.
  const seeded = await page.evaluate(async () => {
    const ids = [
      'u1.hola',
      'u1.gracias',
      'u1.por-favor',
      'u1.si',
      'u1.no',
      'u1.bien',
      'u1.adios',
      'u1.perdon',
    ];
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('hablo', 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = db.transaction('states', 'readwrite');
    const store = tx.objectStore('states');
    const yesterday = Date.now() - 86_400_000;
    for (const id of ids) {
      store.put({
        id,
        stability: 2,
        difficulty: 5,
        due: yesterday,
        lastReview: yesterday - 86_400_000,
        reps: 3, // past the recognise rung, so the ladder asks for production
        lapses: 0,
        state: 'review',
      });
    }
    await new Promise((resolve) => (tx.oncomplete = resolve));
    return ids.length;
  });

  await page.reload({ waitUntil: 'networkidle' });
  const todayAgain = await page.locator('.card').first().innerText();
  if (!/to review/.test(todayAgain)) fail(`seeded ${seeded} due cards but none were offered`);
  else pass('due reviews are picked up on a later day');

  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.locator('.prompt-label').first().waitFor({ timeout: 5000 });

  // Walk until a typed prompt appears, then answer it correctly.
  let typedOk = false;
  for (let step = 0; step < 40 && !typedOk; step++) {
    const label = await page.locator('.prompt-label').first().innerText().catch(() => '');
    if (/say this in spanish/i.test(label)) {
      const want = await page.locator('.prompt').first().innerText();
      const answers = {
        hello: 'hola',
        'thank you': 'gracias',
        please: 'por favor',
        yes: 'si',
        no: 'no',
        well: 'bien',
        goodbye: 'adios',
        sorry: 'perdon',
      };
      const answer = answers[want.trim().toLowerCase()];
      if (!answer) {
        await page.getByRole('button', { name: /I don't know/ }).click();
      } else {
        // Deliberately typed without accents — this must still be graded correct.
        await page.locator('input[type="text"]').fill(answer);
        await page.getByRole('button', { name: 'Check', exact: true }).click();
        const verdict = await page.locator('.feedback').first().getAttribute('class');
        if (!verdict?.includes('correct')) {
          fail(`typing "${answer}" for "${want}" was not accepted (${verdict})`);
        } else {
          typedOk = true;
          pass('typed production accepts an unaccented answer');
          if (SHOTS) await page.screenshot({ path: '/tmp/hablo-produce.png' });
        }
      }
      await page.getByRole('button', { name: 'Continue' }).click();
      continue;
    }

    const cont = page.getByRole('button', { name: 'Continue' });
    if (await cont.isVisible()) {
      await cont.click();
      continue;
    }
    const choices = page.locator('.choice');
    if ((await choices.count()) > 0) {
      await choices.first().click();
      continue;
    }
    const check = page.getByRole('button', { name: 'Got it — check me' });
    if (await check.isVisible()) {
      await check.click();
      continue;
    }
    break;
  }
  if (!typedOk) fail('never reached a typed production prompt for a reviewed card');

  await page.getByRole('button', { name: /Stop here/ }).click();

  // --- settings -----------------------------------------------------------
  await page.getByRole('tab', { name: 'Settings' }).click();
  const scale = page.locator('#scale');
  await scale.fill('1.5');
  const applied = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--scale').trim(),
  );
  if (applied !== '1.5') fail(`text size setting did not apply (--scale = "${applied}")`);
  else pass('text size setting applies live');

  // --- dark mode ----------------------------------------------------------
  await page.selectOption('#theme', 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (bg !== 'rgb(20, 23, 26)') fail(`dark theme did not apply (body background ${bg})`);
  else pass('dark theme applies');
  if (SHOTS) await page.screenshot({ path: '/tmp/hablo-dark.png' });

  if (errors.length > 0) {
    fail(`console errors:\n${errors.map((e) => `        ${e}`).join('\n')}`);
  } else {
    pass('no console errors');
  }
} catch (e) {
  fail(`threw: ${e.stack ?? e}`);
} finally {
  await browser.close();
  server.close();
}

console.log(process.exitCode ? '\nSMOKE FAILED' : '\nSMOKE PASSED');
