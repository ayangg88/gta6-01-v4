import { Input } from './input.js';
import { AudioSystem } from './audio.js';
import { createTraffic, updateTraffic } from './traffic.js';
import { createPedestrians, updatePedestrians } from './pedestrians.js';
import { updatePlayer, enterExit } from './vehicles.js';
import { updatePolice } from './police.js';
import { updateWeapons } from './weapons.js';
import { createCollectibles, updateEconomy, interactEconomy, buyItem } from './economy.js';
import { beginMission, updateMissions, missionList } from './missions.js';
import { updateDialogue } from './dialogue.js';
import { updateParticles } from './particles.js';
import { saveGame, loadGame, hasSave } from './save.js';
import { stageScene } from './staging.js';
import { render } from './render.js';
import { distance, clamp } from './random.js';
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const g = {
  input: new Input(canvas),
  audio: new AudioSystem(),
  player: { x: 850, y: 1100, angle: 0, health: 100, armor: 40, ammo: [120, 0, 0], owned: [true, false, false], weapon: 0, vehicle: null },
  camera: { x: 1030, y: 970 },
  vehicles: [],
  pedestrians: [],
  officers: [],
  enemies: [],
  packages: [],
  pickups: [],
  bullets: [],
  skids: [],
  particles: [],
  heat: 0,
  hideTime: 0,
  arrest: 0,
  policeSpawn: 0,
  fireTimer: 0,
  storeCooldown: 0,
  jumpTime: 0,
  shake: 0,
  elapsed: 0,
  clock: 12 * 60 + 5,
  cash: 1800,
  respect: 0,
  completed: 0,
  mission: null,
  sideJob: null,
  dialogue: null,
  completeScreen: null,
  gameOver: null,
  phone: false,
  shop: null,
  paused: false,
  started: false,
  slot: 1,
  rain: false,
  message: 'Meet Inez at the gold marker • E to talk',
  uiButtons: [],
  save() { saveGame(this); },
  crime(amount) {
    this.heat = clamp(this.heat + amount, 0, 5);
    this.hideTime = 0;
  },
  hurt(amount) {
    const blocked = Math.min(this.player.armor, amount * .7);
    this.player.armor -= blocked;
    this.player.health -= amount - blocked;
    this.shake = 3;
    if (this.player.health <= 0) this.fail('WASTED');
  },
  fail(reason) {
    if (this.gameOver) return;
    this.gameOver = reason;
    this.cash = Math.max(0, this.cash - 300);
    this.mission = null;
    this.dialogue = null;
  }
};
createTraffic(g);
createPedestrians(g);
createCollectibles(g);
function start(continuing = false) {
  g.audio.start();
  if (continuing) loadGame(g, g.slot);
  g.started = true;
  g.paused = false;
  g.camera.x = g.player.x;
  g.camera.y = g.player.y;
}
function respawn() {
  g.gameOver = null;
  g.heat = 0;
  g.arrest = 0;
  g.roadblock = false;
  g.officers = [];
  g.enemies = [];
  g.policeHeli = null;
  g.vehicles = g.vehicles.filter(v => !v.police);
  Object.assign(g.player, { x: 420, y: 2110, health: 100, armor: 0, vehicle: null });
  g.camera.x = g.player.x;
  g.camera.y = g.player.y;
  g.message = 'Back at the garage. There is always another road.';
}
function action(name) {
  g.audio.start();
  if (name.startsWith('slot-')) g.slot = Number(name.split('-')[1]);
  if (name === 'new') start();
  if (name === 'continue') start(true);
  if (name === 'resume') g.paused = false;
  if (name === 'save') g.save();
  if (name === 'load') { loadGame(g, g.slot); g.paused = false; g.heat = 0; }
  if (name === 'title') { g.started = false; g.paused = false; }
  if (name === 'close') { g.shop = null; g.phone = false; }
  if (name === 'complete') g.completeScreen = null;
  if (name === 'respawn') respawn();
  if (name.startsWith('mission-')) beginMission(g, Number(name.split('-')[1]));
  if (name.startsWith('buy-')) buyItem(g, Number(name.split('-')[1]));
  if (name === 'race') {
    g.phone = false;
    g.mission = { index: 7, step: 0, hold: 0, timer: 0, spawned: false };
    g.message = 'Tavi: meet me at the Crown Mile starting line.';
  }
}
function handleInput() {
  const i = g.input;
  if (i.mouse.clicked) {
    const b = [...g.uiButtons].reverse().find(b => i.mouse.x > b.x && i.mouse.x < b.x + b.w && i.mouse.y > b.y && i.mouse.y < b.y + b.h);
    if (b) { action(b.action); return; }
  }
  if (i.tap('KeyM')) g.audio.muted = !g.audio.muted;
  if (!g.started) {
    for (let n = 1; n <= 3; n++) if (i.tap('Digit' + n)) g.slot = n;
    if (i.tap('Enter', 'Space')) start(hasSave(g.slot));
    return;
  }
  if (i.tap('Escape')) {
    if (g.shop || g.phone) { g.shop = null; g.phone = false; }
    else g.paused = !g.paused;
  }
  if (i.tap('F5')) { g.save(); }
  if (i.tap('F9')) { loadGame(g, g.slot); }
  if (g.paused || g.gameOver || g.completeScreen) return;
  if (i.tap('KeyP') && !g.dialogue) g.phone = !g.phone;
  if (i.tap('KeyR')) { g.audio.station = (g.audio.station + 1) % 3; g.audio.musicTimer = 0; }
  if (g.dialogue || g.phone || g.shop) return;
  if (i.tap('KeyE')) {
    if (interactEconomy(g)) return;
    if (!g.mission && distance(g.player, { x: 910, y: 1100 }) < 115 && g.completed < 10) { beginMission(g); return; }
    // During a vault interaction, E belongs to the lock rather than a nearby car.
    const t = g.mission && missionList[g.mission.index].steps[g.mission.step];
    if (t?.mode === 'interact' && distance(g.player, t) < 105) return;
    enterExit(g);
  }
}
function update(dt) {
  handleInput();
  if (!g.started || g.paused || g.gameOver || g.completeScreen || g.phone || g.shop) return;
  if (g.dialogue) { updateDialogue(g, dt); return; }
  g.elapsed += dt;
  g.clock = (g.clock + dt * 2) % 1440;
  g.rain = Math.floor(g.elapsed / 120) % 4 === 3;
  g.shake = Math.max(0, g.shake - dt * 12);
  updatePlayer(g, dt);
  updateTraffic(g, dt);
  updatePedestrians(g, dt);
  updateWeapons(g, dt);
  updatePolice(g, dt);
  updateMissions(g, dt);
  updateEconomy(g, dt);
  updateParticles(g, dt);
  for (const skid of g.skids) skid.life -= dt;
  g.skids = g.skids.filter(s => s.life > 0);
  const v = g.player.vehicle;
  const ahead = v ? v.speed * .32 : 0;
  const tx = g.player.x + Math.cos(g.player.angle) * ahead;
  const ty = g.player.y + Math.sin(g.player.angle) * ahead;
  g.camera.x += (tx - g.camera.x) * Math.min(1, dt * 4);
  g.camera.y += (ty - g.camera.y) * Math.min(1, dt * 4);
  g.audio.update(g, dt);
}
const shot = new URLSearchParams(location.search).get('shot');
if (shot) stageScene(g, shot);
window.game = g;
window.solstice = { beginMission: index => beginMission(g, index), enterExit: () => enterExit(g), stage: name => stageScene(g, name), save: () => g.save() };
let previous = 0;
function frame(time) {
  const dt = Math.min(.034, Math.max(0, (time - previous) / 1000));
  previous = time;
  if (!g.shot) update(dt);
  render(ctx, g);
  g.input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
