/**
 * Generates the app icons.
 *
 * Written by hand rather than pulled from an image library because the mark is
 * simple geometry and this keeps the dependency list at zero. Run with:
 *
 *   node scripts/make-icons.mjs
 *
 * Output is committed, so this only needs re-running if the mark changes.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const BG = [27, 77, 92]; // --primary
const FG = [246, 244, 239]; // --bg, light

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, pixel) {
  const stride = size * 3;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size);
      const at = rowStart + 1 + x * 3;
      raw[at] = r;
      raw[at + 1] = g;
      raw[at + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Signed distance to a rounded rectangle, for anti-aliased edges. */
function roundedRect(x, y, cx, cy, halfW, halfH, radius) {
  const dx = Math.abs(x - cx) - (halfW - radius);
  const dy = Math.abs(y - cy) - (halfH - radius);
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return outside + Math.min(Math.max(dx, dy), 0) - radius;
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * A speech bubble: rounded rect body with a tail at the lower left, plus three
 * dots. Reads at 40px on a home screen, which is the only size that matters.
 */
function icon(x, y, size) {
  const s = size / 100;
  const px = x / s;
  const py = y / s;

  const bg = roundedRect(px, py, 50, 50, 50, 50, 22);
  if (bg > 0.5) return [255, 255, 255];

  const body = roundedRect(px, py, 50, 46, 30, 23, 9);

  // Tail: a triangle hanging below the bubble's lower-left.
  const tx = px - 34;
  const ty = py - 66;
  const inTail = ty > 0 && ty < 16 && tx > -1 && tx < 12 - ty * 0.55 && tx > ty * 0.28 - 2;

  let coverage = body < 0 ? 1 : body < 1 ? 1 - body : 0;
  if (inTail) coverage = 1;

  if (coverage > 0) {
    // Three dots punched out of the bubble.
    for (const dotX of [38, 50, 62]) {
      if (Math.hypot(px - dotX, py - 46) < 4.4) {
        return mix(FG, BG, 1);
      }
    }
    return mix(BG, FG, coverage);
  }

  const edge = bg > -0.5 ? 1 - (bg + 0.5) : 1;
  return mix([255, 255, 255], BG, Math.max(0, Math.min(1, edge)));
}

mkdirSync(OUT, { recursive: true });
for (const size of [180, 192, 512]) {
  const name = size === 180 ? 'icon-180.png' : `icon-${size}.png`;
  writeFileSync(join(OUT, name), png(size, icon));
  console.log(`wrote public/${name}`);
}
