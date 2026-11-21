// Solstice Heat ships its offline city, source modules and four reproducible browser scenes.
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const screenshotLimit = 256 * 1024;
const screenshots = ['1-cover.png', '2-street.png', '3-mission.png', '4-drive.png'];
const expectedScreenshotDimensions = { width: 1280, height: 720 };

function validateFile(path: string, maxBytes?: number, dimensions?: { width: number; height: number }) {
  const file = join(here, path);
  const stats = statSync(file, { throwIfNoEntry: false });
  if (!stats?.isFile()) throw new Error(`missing file: ${path} must exist as a file`);
  if (maxBytes !== undefined && stats.size > maxBytes) {
    throw new Error(`too large: ${path} is ${stats.size} bytes and exceeds the ${maxBytes}-byte limit`);
  }
  if (dimensions !== undefined) {
    const header = readFileSync(file);
    const isPngHeader = header.length >= 24
      && header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      && header.toString('ascii', 12, 16) === 'IHDR';
    const width = isPngHeader ? header.readUInt32BE(16) : undefined;
    const height = isPngHeader ? header.readUInt32BE(20) : undefined;
    if (width !== dimensions.width || height !== dimensions.height) {
      const actual = width === undefined || height === undefined ? 'unreadable PNG dimensions' : `${width}x${height}`;
      throw new Error(`wrong dimensions: ${path} has ${actual}; expected ${dimensions.width}x${dimensions.height}`);
    }
  }
}

try {
  validateFile('game/index.html');
  for (const screenshot of screenshots) {
    validateFile(`screenshots/${screenshot}`, screenshotLimit, expectedScreenshotDimensions);
  }
} catch (error) {
  console.error('Cannot package Solstice Heat:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
