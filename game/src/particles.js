(() => {
  "use strict";
  const { random } = window.Solstice;

  function burst(g, x, y, color, count = 12, force = 85) {
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2;
      const speed = random() * force;
      g.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.4 + random() * 0.6,
        max: 1,
        size: count >= 45 ? 9 + random() * 17 : 2 + random() * 4,
        color,
      });
    }
  }
  function updateParticles(g, dt) {
    for (const p of g.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.vx *= 0.97;
      p.vy *= 0.97;
    }
    g.particles = g.particles.filter((p) => p.life > 0);
    if (g.particles.length > 500)
      g.particles.splice(0, g.particles.length - 500);
  }

  Object.assign(window.Solstice, { burst, updateParticles });
})();
