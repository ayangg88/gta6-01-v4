import { makeVehicle } from './vehicles.js';
import { distance, angleDifference, clamp } from './random.js';
import { hasLineOfSight, isSolid, isWater, nearestRoad } from './city.js';
export function updatePolice(g, dt) {
  const p = g.player;
  const level = Math.ceil(g.heat);
  g.policeSpawn -= dt;
  if (level > 0 && g.policeSpawn <= 0) {
    g.policeSpawn = 5;
    const count = g.vehicles.filter(v => v.police && distance(v, p) < 1200).length;
    if (count < 2 + level) {
      const water = p.vehicle?.water;
      const road = nearestRoad(p.x - 450, p.y + 160);
      const v = makeVehicle(water ? 'boat' : level === 5 ? 'armored' : 'police', water ? p.x - 420 : road.x, water ? p.y + 90 : road.y, 0, '#e8e9dd', true);
      v.police = true;
      g.vehicles.push(v);
    }
    if (!p.vehicle && g.officers.length < level + 2) g.officers.push({ x: p.x - 290, y: p.y - 100, hp: 80, cooldown: 1 });
    if (level >= 3 && !g.policeHeli) g.policeHeli = { x: p.x - 230, y: p.y - 240, angle: .2 };
    if (level >= 4 && !g.roadblock) {
      const road = nearestRoad(p.x + 400, p.y);
      for (let i = 0; i < 3; i++) {
        const v = makeVehicle('police', road.x, road.y - 45 + i * 40, Math.PI / 2, '#e9e6db');
        v.police = true;
        v.block = true;
        g.vehicles.push(v);
      }
      g.roadblock = true;
    }
  }
  let seen = false;
  for (const v of g.vehicles) {
    if (!v.police || v.hp <= 0 || !level) continue;
    const d = distance(v, p);
    if (d < 420 && hasLineOfSight(v, p)) seen = true;
    if (v.block) continue;
    const targetAngle = Math.atan2(p.y - v.y, p.x - v.x);
    v.angle += clamp(angleDifference(targetAngle, v.angle), -dt * 1.9, dt * 1.9);
    v.speed += ((d > 65 ? 160 + level * 22 : 25) - v.speed) * dt;
    const nx = v.x + Math.cos(v.angle) * v.speed * dt;
    const ny = v.y + Math.sin(v.angle) * v.speed * dt;
    if (v.water ? isWater(nx, ny) : !isSolid(nx, ny, 12)) { v.x = nx; v.y = ny; }
    else { v.angle += dt * 3; v.speed = 30; }
    if (d < 62) {
      if (p.vehicle) p.vehicle.hp -= dt * level * 1.3;
      else g.arrest += dt;
    }
  }
  for (const o of g.officers) {
    if (o.hp <= 0 || !level) continue;
    const d = distance(o, p);
    const a = Math.atan2(p.y - o.y, p.x - o.x);
    if (d > 40 && !isSolid(o.x + Math.cos(a) * 4, o.y + Math.sin(a) * 4)) {
      o.x += Math.cos(a) * dt * 75;
      o.y += Math.sin(a) * dt * 75;
    }
    o.cooldown -= dt;
    if (d < 330 && hasLineOfSight(o, p)) {
      seen = true;
      if (o.cooldown < 0) {
        o.cooldown = 1.2;
        g.bullets.push({ x: o.x, y: o.y, vx: Math.cos(a) * 500, vy: Math.sin(a) * 500, life: .8, enemy: true, damage: 7 });
      }
    }
  }
  if (g.policeHeli && level >= 3) {
    const h = g.policeHeli;
    h.x += (p.x - 175 - h.x) * dt * .55;
    h.y += (p.y - 190 - h.y) * dt * .55;
    h.angle = Math.atan2(p.y - h.y, p.x - h.x);
    // A roof or a long separation still breaks the aerial search.
    if (distance(h, p) < 360 && hasLineOfSight(h, p)) seen = true;
  } else if (!level) g.policeHeli = null;
  g.seen = seen;
  if (!seen && g.heat > 0) {
    g.hideTime += dt;
    if (g.hideTime > 6) g.heat = Math.max(0, g.heat - dt * .12);
  } else g.hideTime = 0;
  if (g.arrest > 3.5) g.fail('BUSTED');
  if (g.arrest > 0 && !seen) g.arrest = Math.max(0, g.arrest - dt);
}
