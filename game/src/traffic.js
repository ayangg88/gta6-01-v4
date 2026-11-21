import { makeVehicle } from './vehicles.js';
import { roadsX, roadsY } from './city.js';
import { random, pick, distance } from './random.js';
const palette = ['#ea8154', '#e6c35b', '#75a9ad', '#f4dfbb', '#8ba58b', '#9d7294', '#d8625e', '#50697c'];
export function createTraffic(g) {
  const types = ['sedan', 'taxi', 'pickup', 'sports', 'van', 'muscle', 'limo', 'bus', 'motorcycle'];
  for (let i = 0; i < 90; i++) {
    const y = pick(roadsY);
    const x = 180 + random() * 1700;
    const direction = i % 2 === 0 ? 0 : Math.PI;
    const v = makeVehicle(pick(types), x, y + (direction ? -23 : 23), direction, pick(palette), true);
    v.speed = 60 + random() * 45;
    g.vehicles.push(v);
  }
  for (let i = 0; i < 42; i++) {
    const x = pick(roadsX.filter(x => x < 2000));
    const y = pick(roadsY) + 110 + random() * 230;
    g.vehicles.push(makeVehicle(pick(types), x + 48, y, Math.PI / 2, pick(palette)));
  }
  g.vehicles.push(makeVehicle('sports', 820, 1100, -Math.PI / 2, '#f16b42'));
  g.vehicles.push(makeVehicle('taxi', 420, 1110, 0, '#f6c84e'));
  for (let i = 0; i < 7; i++) {
    g.vehicles.push(makeVehicle(i % 2 ? 'jetski' : 'boat', 2100 + i * 100, 2630 + i % 3 * 100, -Math.PI / 2, pick(palette)));
  }
  g.vehicles.push(makeVehicle('helicopter', 3510, 1150, 0, '#eacb7f'));
}
export function updateTraffic(g, dt) {
  for (const v of g.vehicles) {
    if (!v.ai || v.police || v.hp <= 0 || distance(v, g.player) > 1500) continue;
    const ahead = { x: v.x + Math.cos(v.angle) * 62, y: v.y + Math.sin(v.angle) * 62 };
    const blocked = g.vehicles.some(o => o !== v && o.hp > 0 && distance(o, ahead) < 41);
    const junction = roadsX.some(x => Math.abs(x - v.x) < 70) && roadsY.some(y => Math.abs(y - v.y) < 70);
    const red = junction && Math.floor(g.elapsed / 5 + Math.round(v.x / 500)) % 3 === 0;
    const target = blocked || red ? 0 : 85;
    v.speed += (target - v.speed) * Math.min(1, dt * 2);
    v.x += Math.cos(v.angle) * v.speed * dt;
    v.y += Math.sin(v.angle) * v.speed * dt;
    if (v.x > 1940) { v.angle = Math.PI; v.y -= 46; }
    if (v.x < 130) { v.angle = 0; v.y += 46; }
  }
}
