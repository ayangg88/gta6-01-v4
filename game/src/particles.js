import { random } from './random.js';
export function burst(g, x, y, color, count = 12, force = 85) {
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2;
    const speed = random() * force;
    g.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .4 + random() * .6, max: 1, size: 2 + random() * 4, color });
  }
}
export function updateParticles(g, dt) {
  for (const p of g.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.vx *= .97;
    p.vy *= .97;
  }
  g.particles = g.particles.filter(p => p.life > 0);
  if (g.particles.length > 500) g.particles.splice(0, g.particles.length - 500);
}
