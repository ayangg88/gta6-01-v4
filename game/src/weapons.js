import { distance, random } from './random.js';
import { buildings } from './city.js';
import { burst } from './particles.js';
export const weaponData = [
  { name: 'PISTOL', delay: .28, damage: 28, pellets: 1, spread: .025, price: 0 },
  { name: 'SHOTGUN', delay: .8, damage: 20, pellets: 7, spread: .21, price: 900 },
  { name: 'SMG', delay: .085, damage: 15, pellets: 1, spread: .09, price: 1900 }
];
export function updateWeapons(g, dt) {
  const p = g.player;
  g.fireTimer = Math.max(0, g.fireTimer - dt);
  for (let i = 0; i < 3; i++) if (g.input.tap('Digit' + (i + 1)) && p.owned[i]) p.weapon = i;
  if (g.input.mouse.down && !p.vehicle && g.fireTimer <= 0 && !g.dialogue && !g.phone && !g.shop) {
    const w = weaponData[p.weapon];
    if (p.ammo[p.weapon] <= 0) { g.message = 'Empty • visit Nico or find ammunition'; return; }
    p.ammo[p.weapon]--;
    g.fireTimer = w.delay;
    for (let i = 0; i < w.pellets; i++) {
      const a = p.angle + (random() - .5) * w.spread;
      g.bullets.push({ x: p.x + Math.cos(a) * 17, y: p.y + Math.sin(a) * 17, vx: Math.cos(a) * 850, vy: Math.sin(a) * 850, damage: w.damage, life: .7 });
    }
    burst(g, p.x + Math.cos(p.angle) * 23, p.y + Math.sin(p.angle) * 23, '#ffdf7b', 5, 25);
    g.audio.effect('shot');
    g.crime(.18);
    for (const ped of g.pedestrians) if (distance(ped, p) < 500) ped.fear = 8;
  }
  for (const b of g.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.enemy && distance(b, p) < 17) {
      g.hurt(b.damage);
      b.life = 0;
    }
    if (!b.enemy) {
      for (const o of [...g.officers, ...g.enemies, ...g.pedestrians]) {
        if (o.hp > 0 && distance(b, o) < 15) {
          o.hp -= b.damage;
          b.life = 0;
          burst(g, b.x, b.y, '#e6dcbd', 6);
          if (o.hp <= 0) g.pickups.push({ x: o.x, y: o.y, type: 'ammo' });
          break;
        }
      }
      for (const v of g.vehicles) if (v.hp > 0 && distance(b, v) < 24) { v.hp -= b.damage * .45; b.life = 0; }
    }
    if (buildings.some(c => b.x > c.x && b.x < c.x + c.w && b.y > c.y && b.y < c.y + c.h)) {
      b.life = 0;
      burst(g, b.x, b.y, '#e9ceb1', 3);
    }
  }
  g.bullets = g.bullets.filter(b => b.life > 0);
  for (const e of g.enemies) {
    if (e.hp <= 0) continue;
    e.cooldown -= dt;
    if (distance(e, p) < 450 && e.cooldown < 0) {
      e.cooldown = 1.7;
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      g.bullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 450, vy: Math.sin(a) * 450, enemy: true, damage: 9, life: 1 });
    }
  }
}
