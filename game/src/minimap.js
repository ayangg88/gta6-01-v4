(() => {
  "use strict";
  const { roadsX, roadsY, shops, buildings, missionTarget } = window.Solstice;

  function drawMinimap(ctx, g) {
    const x = 28;
    const y = 478;
    const w = 226;
    const h = 204;
    ctx.save();
    ctx.fillStyle = "#102d36";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#e9e2c3";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.rect(x + 6, y + 25, w - 12, h - 31);
    ctx.clip();
    const scale = 0.088;
    const mx = (wx) => x + w / 2 + (wx - g.player.x) * scale;
    const my = (wy) => y + h / 2 + 12 + (wy - g.player.y) * scale;
    ctx.fillStyle = "#245d6e";
    ctx.fillRect(mx(2020), my(0), 1160 * scale, 3900 * scale);
    ctx.fillStyle = "#29434a";
    for (const b of buildings)
      ctx.fillRect(mx(b.x), my(b.y), b.w * scale, b.h * scale);
    ctx.strokeStyle = "#aab4a1";
    ctx.lineWidth = 3.5;
    for (const rx of roadsX) {
      ctx.beginPath();
      ctx.moveTo(mx(rx), my(50));
      ctx.lineTo(mx(rx), my(3800));
      ctx.stroke();
    }
    for (const ry of roadsY) {
      for (const [left, right] of [
        [50, 2020],
        [3180, 4750],
      ]) {
        ctx.beginPath();
        ctx.moveTo(mx(left), my(ry));
        ctx.lineTo(mx(right), my(ry));
        ctx.stroke();
      }
    }
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(mx(2020), my(1520));
    ctx.lineTo(mx(3180), my(1520));
    ctx.stroke();
    const dot = (p, color, radius) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(mx(p.x), my(p.y), radius, 0, Math.PI * 2);
      ctx.fill();
    };
    for (const s of shops) dot(s, "#92dfc0", 3);
    for (const v of g.vehicles) if (v.police) dot(v, "#f58e88", 3.5);
    for (const p of g.packages) if (!p.collected) dot(p, "#c2b5f2", 2);
    const target = g.sideJob || missionTarget(g);
    dot(target, "#ffd478", 5);
    ctx.save();
    ctx.translate(mx(g.player.x), my(g.player.y));
    ctx.rotate(g.player.angle + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.fillStyle = "#f4e9ce";
    ctx.font = "bold 10px monospace";
    ctx.fillText("N ↑  SOLSTICE BAY", x + 11, y + 16);
    ctx.fillStyle = "#819c9f";
    ctx.font = "9px monospace";
    ctx.fillText("GPS / LIVE", x + 153, y + 16);
  }

  Object.assign(window.Solstice, { drawMinimap });
})();
