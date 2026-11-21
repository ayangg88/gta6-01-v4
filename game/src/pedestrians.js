import { roadsX, roadsY, isSolid } from './city.js';
import { random, pick, distance } from './random.js';
import { burst } from './particles.js';
export function createPedestrians(g) {
  for (let i = 0; i < 170; i++) {
    const x = pick(roadsX.filter(x => x < 2000)) + (i % 2 ? 82 : -82);
    const y = 450 + random() * 3100;
    g.pedestrians.push({ x, y, angle: i % 2 ? Math.PI / 2 : -Math.PI / 2, fear: 0, color: pick(['#ef956b', '#f3d980', '#6dbeb5', '#a7b3dc', '#e7e2d1', '#d2839a']), hp: 50 });
  }
}
export function updatePedestrians(g, dt) {
  for (const p of g.pedestrians) {
    if (p.hp <= 0 || distance(p, g.player) > 1100) continue;
    if (p.fear > 0) {
      p.angle = Math.atan2(p.y - g.player.y, p.x - g.player.x);
      p.fear -= dt;
    }
    const speed = p.fear > 0 ? 110 : 23;
    const x = p.x + Math.cos(p.angle) * speed * dt;
    const y = p.y + Math.sin(p.angle) * speed * dt;
    if (!isSolid(x, y, 7)) { p.x = x; p.y = y; }
    else p.angle += Math.PI;
    const v = g.player.vehicle;
    if (v && !v.air && distance(v, p) < 28 && Math.abs(v.speed) > 85) {
      p.hp = 0;
      burst(g, p.x, p.y, '#e7d6b6', 12);
      g.crime(1);
      v.speed *= .8;
      g.message = 'Civilian injured • police alerted';
    }
  }
}
