import { random, pick } from './random.js';
export const WORLD = { width: 4800, height: 3900 };
export const roadsX = [280, 780, 1280, 1780, 3370, 3870, 4370];
export const roadsY = [520, 1020, 1520, 2020, 2520, 3020, 3520];
export const districts = [
  { name: 'CROWN MILE', x: 1080, y: 840, sub: 'CASINOS • LATE NIGHTS • BAD IDEAS' },
  { name: 'OLD SOLSTICE', x: 550, y: 1840, sub: 'THE CITY BEFORE THE GLITTER' },
  { name: 'PEARL MARINA', x: 1710, y: 2820, sub: 'SLIPS 01 — 24' },
  { name: 'SUNBREAK BEACH', x: 580, y: 3300, sub: 'BOARDWALK / PUBLIC BEACH' },
  { name: 'VERDANT UNIVERSITY', x: 820, y: 300, sub: 'HILLSIDE CAMPUS' },
  { name: 'SOLSTICE AIRFIELD', x: 3870, y: 850, sub: 'PRIVATE AVIATION' },
  { name: 'EAST FOUNDRY', x: 3780, y: 2700, sub: 'INDUSTRIAL PORT' }
];
export const shops = [
  { type: 'arms', name: 'NICO’S HARDWARE', x: 680, y: 1430, color: '#f5bc63' },
  { type: 'paint', name: 'CHROMA CUSTOMS', x: 1380, y: 2110, color: '#ed7890' },
  { type: 'garage', name: 'REYES MOTOR WORKS', x: 380, y: 2110, color: '#6edcbe' },
  { type: 'store', name: 'SUNSTOP MARKET', x: 880, y: 2610, color: '#e7ce78' },
  { type: 'courier', name: 'QUICKPOST', x: 1380, y: 3110, color: '#85caea' },
  { type: 'taxi', name: 'BAYLINE CABS', x: 380, y: 1110, color: '#f5d15c' }
];
export const buildings = [];
export const trees = [];
export const props = [];
const walls = ['#eab99b', '#ead9b5', '#c1d5c2', '#f0c2bd', '#b4d0d6', '#e7cd90', '#c3bdd4'];
const roofs = ['#c47b64', '#d4b48b', '#819fa0', '#cb9995', '#a8b39c', '#d5c3ac'];
for (const x of roadsX) {
  for (const y of roadsY.slice(0, -1)) {
    if (x === 1780 && y > 2020) continue;
    for (let i = 0; i < 4; i++) {
      const bx = x + 95 + (i % 2) * 180;
      const by = y + 100 + Math.floor(i / 2) * 170;
      if (bx > 4660 || by > 3700 || (bx > 1950 && bx < 3180)) continue;
      buildings.push({ x: bx, y: by, w: 126 + random() * 26, h: 110 + random() * 30, height: 12 + random() * 12, wall: pick(walls), roof: pick(roofs), casino: x === 780 && y === 520, seed: i });
    }
  }
}
// The casino courtyard is navigable; its north wing carries the signage.
buildings.push({ x: 1328, y: 645, w: 330, h: 165, height: 28, wall: '#efd8b1', roof: '#ceaaa0', casino: true, seed: 7 });
export const signs = [
  { x: 1080, y: 662, text: 'A U R E O L E', color: '#ffdf82', sub: 'CASINO & ROOF CLUB' },
  { x: 1490, y: 688, text: 'THE GILDED TIDE', color: '#b8f4de', sub: 'PRIVATE VAULT • MEMBERS' },
  { x: 965, y: 1195, text: 'MIRAGE', color: '#ffb3c1', sub: 'COCKTAILS / LIVE SOUL' },
  { x: 1454, y: 1192, text: 'HOTEL SOL', color: '#fff09b', sub: 'VACANCY' },
  { x: 584, y: 670, text: 'PALMA', color: '#b9f9ed', sub: 'SOCIAL CLUB' }
];
for (let x = 130; x < 1900; x += 135) {
  for (const y of roadsY) {
    trees.push({ x, y: y - 86, palm: true, size: 17 + random() * 6 });
    props.push({ x: x + 57, y: y + 78, type: 'lamp' });
  }
}
for (let i = 0; i < 65; i++) {
  trees.push({ x: 70 + random() * 1800, y: 60 + random() * 340, palm: false, size: 18 + random() * 12 });
}
export function isWater(x, y) {
  if (x < 45 || y < 25 || x > 4750 || y > 3830) return true;
  return x > 2020 && x < 3180 && !(y > 1430 && y < 1610);
}
export function isSolid(x, y, radius = 10) {
  if (isWater(x, y)) return true;
  return buildings.some(b => x > b.x - radius && x < b.x + b.w + radius && y > b.y - radius && y < b.y + b.h + radius);
}
export function roadAt(x, y) {
  return roadsX.some(rx => Math.abs(rx - x) < 63) || roadsY.some(ry => Math.abs(ry - y) < 63);
}
export function nearestRoad(x, y) {
  let best = { x: 780, y: 1020, d: Infinity };
  for (const rx of roadsX) {
    const d = Math.abs(rx - x);
    if (d < best.d) best = { x: rx, y, d };
  }
  for (const ry of roadsY) {
    const d = Math.abs(ry - y);
    if (d < best.d) best = { x, y: ry, d };
  }
  return best;
}
export function hasLineOfSight(a, b) {
  const count = Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 25);
  for (let i = 1; i < count; i++) {
    const x = a.x + (b.x - a.x) * i / count;
    const y = a.y + (b.y - a.y) * i / count;
    if (buildings.some(c => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h)) return false;
  }
  return true;
}
