(() => {
  "use strict";
  const {
    buildings,
    trees,
    props,
    roadsX,
    roadsY,
    shops,
    signs,
    districts,
    WORLD,
    distance,
    missionTarget,
    drawHUD,
  } = window.Solstice;

  const TAU = Math.PI * 2;
  // A tiny repeating original surface pattern gives the city a printed, sun-worn finish.
  const surface = document.createElement("canvas");
  surface.width = 64;
  surface.height = 64;
  const surfaceContext = surface.getContext("2d");
  for (let i = 0; i < 150; i++) {
    const x = (i * 17 + i * i) % 64;
    const y = (i * 31 + Math.floor(i / 3) * 7) % 64;
    surfaceContext.fillStyle = i % 2 ? "#ffffff09" : "#152c3009";
    surfaceContext.fillRect(x, y, 1, 1);
  }

  function rect(c, color, x, y, w, h) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  }
  function line(c, color, width, x, y, xx, yy) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(xx, yy);
    c.stroke();
  }
  function ellipse(c, color, x, y, rx, ry) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU);
    c.fill();
  }
  function visible(g, x, y, margin = 220) {
    return (
      Math.abs(x - g.camera.x) < 640 + margin &&
      Math.abs(y - g.camera.y) < 360 + margin
    );
  }
  function drawRoad(c, x, y, w, h, horizontal) {
    rect(c, "#cebfa1", x - 19, y - 19, w + 38, h + 38);
    rect(c, "#f1dfba", x - 15, y - 15, w + 30, h + 30);
    rect(c, "#a39885", x - 2, y - 2, w + 4, h + 4);
    rect(c, "#777b74", x, y, w, h);
    c.setLineDash([20, 22]);
    if (horizontal) {
      line(c, "#dfc87f", 2, x, y + h / 2 - 3, x + w, y + h / 2 - 3);
      line(c, "#dfc87f", 2, x, y + h / 2 + 3, x + w, y + h / 2 + 3);
    } else {
      line(c, "#dfc87f", 2, x + w / 2 - 3, y, x + w / 2 - 3, y + h);
      line(c, "#dfc87f", 2, x + w / 2 + 3, y, x + w / 2 + 3, y + h);
    }
    c.setLineDash([]);
    if (horizontal) {
      line(c, "#d5d4b9", 1, x, y + 7, x + w, y + 7);
      line(c, "#d5d4b9", 1, x, y + h - 7, x + w, y + h - 7);
    } else {
      line(c, "#d5d4b9", 1, x + 7, y, x + 7, y + h);
      line(c, "#d5d4b9", 1, x + w - 7, y, x + w - 7, y + h);
    }
  }
  function drawGround(c, g) {
    rect(c, "#54bdc9", 0, 0, 4800, 3900);
    // Wavelets are spatially seeded, keeping staging reproducible.
    for (
      let y = Math.floor((g.camera.y - 430) / 46) * 46;
      y < g.camera.y + 460;
      y += 46
    ) {
      for (let x = 2035; x < 3180; x += 73) {
        const offset = Math.sin(x * 0.01 + y) * 22;
        line(c, "#89d7d7", 1.5, x + offset, y, x + 17 + offset, y - 3);
        line(c, "#47afbd", 1, x + offset + 26, y + 16, x + offset + 47, y + 16);
      }
    }
    const glare = c.createRadialGradient(2760, 1140, 0, 2760, 1140, 660);
    glare.addColorStop(0, "#fff3b42f");
    glare.addColorStop(1, "#fff3b400");
    c.fillStyle = glare;
    c.fillRect(2020, 200, 1160, 1800);
    rect(c, "#c5c69a", 40, 40, 1980, 3790);
    rect(c, "#c9c7a2", 3180, 40, 1570, 3790);
    // The west waterfront has a broad sandy promenade.
    rect(c, "#e5d4a8", 1920, 40, 100, 3790);
    rect(c, "#e7d3a0", 45, 3210, 1880, 620);
    rect(c, "#c4b08a", 1945, 40, 18, 3790);
    rect(c, "#eeddb9", 1963, 40, 57, 3790);
    rect(c, "#a9af80", 55, 55, 1810, 320);
    for (const ry of roadsY) {
      if (Math.abs(ry - g.camera.y) < 470) {
        drawRoad(c, 90, ry - 59, 1930, 118, true);
        drawRoad(c, 3180, ry - 59, 1480, 118, true);
      }
    }
    for (const rx of roadsX)
      if (Math.abs(rx - g.camera.x) < 760)
        drawRoad(c, rx - 59, 390, 118, 3300, false);
    for (const rx of roadsX) {
      for (const ry of roadsY) {
        if (!visible(g, rx, ry, 90)) continue;
        rect(c, "#777b74", rx - 59, ry - 59, 118, 118);
        for (let n = -45; n < 50; n += 14) {
          rect(c, "#f6eccf", rx + n, ry - 77, 8, 15);
          rect(c, "#f6eccf", rx + n, ry + 62, 8, 15);
          rect(c, "#f6eccf", rx - 77, ry + n, 15, 8);
          rect(c, "#f6eccf", rx + 62, ry + n, 15, 8);
        }
        rect(c, "#263d3b", rx - 77, ry - 86, 8, 20);
        ellipse(
          c,
          Math.floor(g.elapsed / 5) % 2 ? "#fa9775" : "#9adc97",
          rx - 73,
          ry - 81,
          2,
          2,
        );
      }
    }
    // Concrete piers, finger slips, mooring cleats and timber planks.
    for (const y of [2450, 2810, 3000]) {
      rect(c, "#397f85", 2008, y + 13, 205, 38);
      rect(c, "#c3a878", 1998, y, 220, 29);
      for (let x = 2000; x < 2218; x += 13)
        line(c, "#a78c62", 1, x, y + 2, x, y + 27);
      for (let x = 2040; x < 2210; x += 60) {
        rect(c, "#c3a878", x, y, 15, 92);
        ellipse(c, "#f3e7c6", x + 7, y + 83, 4, 4);
      }
    }
    // Runway and airport furniture.
    rect(c, "#626f6c", 3680, 580, 240, 1100);
    rect(c, "#e6ddba", 3690, 592, 3, 1075);
    rect(c, "#e6ddba", 3907, 592, 3, 1075);
    for (let y = 630; y < 1640; y += 90) rect(c, "#f2ead3", 3796, y, 8, 43);
    c.fillStyle = "#f3e9cd";
    c.font = "bold 56px monospace";
    c.fillText("09", 3767, 735);
    rect(c, "#aeb5a1", 3410, 1050, 200, 200);
    c.strokeStyle = "#f5e3b2";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(3510, 1150, 74, 0, TAU);
    c.stroke();
    c.font = "bold 68px sans-serif";
    c.fillText("H", 3486, 1176);
    // Cargo stacks in the industrial port.
    for (let i = 0; i < 20; i++) {
      const x = 3410 + (i % 5) * 185;
      const y = 2810 + Math.floor(i / 5) * 110;
      rect(c, ["#ae6d57", "#749b99", "#c1a267"][i % 3], x, y, 150, 65);
      for (let n = 10; n < 148; n += 15)
        line(c, "#172e362d", 3, x + n, y + 4, x + n, y + 61);
    }
    // A long high causeway with short, heavy noon shadows.
    rect(c, "#2a78846b", 2020, 1450, 1160, 197);
    drawRoad(c, 1940, 1442, 1320, 156, true);
    rect(c, "#d4c29b", 2005, 1428, 1190, 12);
    rect(c, "#f4e6be", 2005, 1428, 1190, 4);
    rect(c, "#d4c29b", 2005, 1600, 1190, 12);
    rect(c, "#f4e6be", 2005, 1600, 1190, 4);
    for (let x = 2060; x < 3180; x += 80) {
      line(c, "#395e63", 2, x, 1433, x, 1440);
      line(c, "#395e63", 2, x, 1600, x, 1610);
      if (x % 160 < 85) {
        rect(c, "#336e7a66", x + 9, 1610, 28, 36);
        rect(c, "#d7cbb0", x, 1597, 15, 20);
        rect(c, "#f1e2be", x - 3, 1418, 20, 22);
      }
    }
    // Low suspension pylons and fine stays imply the bridge's height.
    for (const x of [2190, 3000]) {
      for (const y of [1424, 1609]) {
        rect(c, "#346d7770", x + 12, y + 10, 36, 42);
        rect(c, "#b4bcae", x - 9, y - 33, 24, 47);
        rect(c, "#f4e6c8", x - 11, y - 35, 24, 10);
        line(c, "#fff0cb", 2, x, y - 27, x - 155, y);
        line(c, "#fff0cb", 2, x, y - 27, x + 155, y);
      }
    }
    // Buoys and boardwalk beach furniture.
    for (const [x, y] of [
      [2460, 2300],
      [2700, 1900],
      [2910, 1850],
      [2900, 2750],
    ]) {
      ellipse(c, "#a0e2dd", x, y + 6, 16, 6);
      ellipse(c, "#e8a261", x, y, 6, 8);
      line(c, "#f9e9bc", 2, x, y, x, y - 18);
    }
    rect(c, "#bd9f72", 110, 3290, 1780, 48);
    for (let x = 120; x < 1890; x += 18)
      line(c, "#a68b64", 1, x, 3290, x, 3338);
    for (let i = 0; i < 14; i++) {
      const x = 200 + i * 115;
      ellipse(c, "#c8b37e66", x + 11, 3448, 25, 12);
      ellipse(c, i % 2 ? "#e39372" : "#75b9b6", x, 3430, 23, 23);
      line(c, "#f4dfad", 2, x, 3408, x, 3452);
    }
  }
  function drawBuilding(c, b) {
    const { x, y, w, h, height } = b;
    rect(c, "#4d56482c", x + 12, y + 14, w + 7, h + 7);
    rect(c, "#857967", x - 2, y - 2, w + 4, h + 4);
    rect(c, b.wall, x, y, w, h);
    rect(c, "#82776b", x, y + h - height, w, height);
    rect(c, b.wall, x + 3, y + h - height + 2, w - 6, height - 3);
    for (let xx = x + 10; xx < x + w - 12; xx += 21) {
      rect(c, "#345c66", xx, y + h - height + 5, 12, 8);
      rect(c, "#8cc1bf", xx + 1, y + h - height + 5, 3, 7);
    }
    rect(c, "#f2dfba", x + 2, y - height, w - 4, h - 3);
    rect(c, b.roof, x + 8, y - height + 6, w - 16, h - 15);
    c.fillStyle = c.createPattern(surface, "repeat");
    c.fillRect(x + 8, y - height + 6, w - 16, h - 15);
    line(c, "#ffffff55", 2, x + 9, y - height + 8, x + w - 10, y - height + 8);
    // Thin roof seams, ledges and service walkways carry the scale of the city.
    line(
      c,
      "#243d3c18",
      1,
      x + 9,
      y - height + h * 0.58,
      x + w - 10,
      y - height + h * 0.58,
    );
    line(
      c,
      "#243d3c18",
      1,
      x + w * 0.6,
      y - height + 9,
      x + w * 0.6,
      y - height + h - 10,
    );
    rect(c, "#f1dab23d", x + 14, y - height + h - 25, w - 30, 8);
    // A roof terrace, skylights, ducts and air handlers.
    rect(c, "#384e4f30", x + w - 46, y - height + 24, 25, 35);
    rect(c, "#d2d4be", x + w - 50, y - height + 18, 25, 33);
    for (let n = 4; n < 28; n += 5)
      line(
        c,
        "#8e9b94",
        1,
        x + w - 47,
        y - height + 18 + n,
        x + w - 28,
        y - height + 18 + n,
      );
    rect(c, "#6e9399", x + 20, y - height + 20, 35, 24);
    line(c, "#c5ded4", 2, x + 37, y - height + 20, x + 37, y - height + 44);
    if (b.seed % 3 === 0) {
      rect(c, "#ecdbb7", x + 17, y - height + 58, 42, 29);
      rect(c, "#65b9bf", x + 20, y - height + 61, 36, 23);
      line(c, "#a3e1dc", 1, x + 22, y - height + 70, x + 53, y - height + 70);
      ellipse(c, "#e5ae7f", x + 80, y - height + 75, 13, 13);
      line(c, "#ffdcaa", 1, x + 68, y - height + 75, x + 92, y - height + 75);
    } else if (b.seed % 3 === 1) {
      for (let i = 0; i < 3; i++) {
        rect(c, "#567e64", x + 18 + i * 27, y - height + 68, 19, 17);
        ellipse(c, "#799b69", x + 27 + i * 27, y - height + 71, 11, 9);
      }
    } else {
      rect(c, "#d2c6ae", x + 17, y - height + 63, 44, 30);
      rect(c, "#a18d76", x + 22, y - height + 67, 34, 22);
      line(c, "#dfd3b9", 2, x + 25, y - height + 71, x + 53, y - height + 71);
      line(c, "#dfd3b9", 2, x + 25, y - height + 78, x + 53, y - height + 78);
    }
    if (b.casino) {
      rect(c, "#6c696158", x + 15, y + h - height + 16, w - 30, 20);
      rect(c, "#397a78", x + 11, y + h - height + 11, w - 22, 15);
      for (let xx = x + 12; xx < x + w - 15; xx += 17)
        rect(c, "#e8c886", xx, y + h - height + 11, 8, 15);
      for (let xx = x + 24; xx < x + w - 15; xx += 48) {
        rect(c, "#e8d7b3", xx, y + h - height + 8, 9, height + 4);
        ellipse(c, "#4d8a6a", xx + 6, y + h + 13, 13, 7);
      }
    }
  }
  function drawTree(c, t) {
    const { x, y, size } = t;
    ellipse(c, "#314d4238", x + 12, y + 14, size * 1.1, size * 0.68);
    line(c, "#a68655", 5, x + 5, y + 6, x, y - 15);
    if (!t.palm) {
      ellipse(c, "#67895b", x, y - 18, size, size * 0.8);
      ellipse(c, "#8aa56c", x - 5, y - 24, size * 0.65, size * 0.6);
      return;
    }
    c.save();
    c.translate(x, y - 17);
    for (let i = 0; i < 7; i++) {
      c.rotate(TAU / 7);
      c.fillStyle = i % 2 ? "#3e8567" : "#589668";
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(15, -12, size + 7, 1);
      c.quadraticCurveTo(12, -3, 0, 3);
      c.fill();
      line(c, "#94b47b", 0.8, 0, 0, size + 1, 0);
    }
    ellipse(c, "#c6bd78", 0, 0, 3, 3);
    c.restore();
  }
  function drawVehicle(c, v, g) {
    if (v.hp <= 0) return;
    c.save();
    c.translate(v.x, v.y);
    if (v === g.player.vehicle && g.jumpTime > 0) {
      const scale = 1 + Math.sin(g.jumpTime * Math.PI) * 0.35;
      c.scale(scale, scale);
    }
    c.rotate(v.angle);
    const l = v.length;
    const w = v.width;
    if (v.water) {
      c.strokeStyle = "#ddfff2aa";
      c.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.moveTo(-l / 2 - 5 - i * 17, -w / 2 - 7 - i * 6);
        c.quadraticCurveTo(
          -l / 2 - 25 - i * 21,
          0,
          -l / 2 - 5 - i * 17,
          w / 2 + 7 + i * 6,
        );
        c.stroke();
      }
      ellipse(c, "#24778355", 2, 5, l * 0.55, w * 0.8);
      c.fillStyle = "#f3e8ca";
      c.beginPath();
      c.moveTo(l * 0.62, 0);
      c.quadraticCurveTo(l * 0.23, -w * 0.78, -l * 0.5, -w * 0.5);
      c.lineTo(-l * 0.5, w * 0.5);
      c.quadraticCurveTo(l * 0.23, w * 0.78, l * 0.62, 0);
      c.fill();
      rect(c, v.color, -l * 0.42, -w * 0.36, l * 0.59, w * 0.72);
      rect(c, "#284d5d", l * 0.07, -w * 0.33, l * 0.12, w * 0.66);
      rect(c, "#f6e9cf", -l * 0.18, -w * 0.22, l * 0.2, w * 0.44);
      rect(c, "#304a4d", -l * 0.6, -7, 8, 14);
      if (v.police) {
        rect(c, "#386799", -10, -w * 0.46, 8, 5);
        rect(c, "#ec745c", 0, -w * 0.46, 8, 5);
      }
    } else if (v.air) {
      drawHelicopterBody(c, g, v.color);
    } else {
      rect(c, "#334b473e", -l / 2 + 7, -w / 2 + 6, l, w + 2);
      rect(c, "#26383b", -l / 2 + 6, -w / 2 - 3, 10, w + 6);
      rect(c, "#26383b", l / 2 - 17, -w / 2 - 3, 10, w + 6);
      if (v.type === "motorcycle") {
        rect(c, v.color, -10, -6, 23, 12);
        ellipse(c, "#2a3e43", -3, 0, 8, 6);
        ellipse(c, "#d5c397", 7, 0, 5, 5);
      } else {
        c.fillStyle = v.police ? "#e7e7d9" : v.color;
        c.beginPath();
        c.roundRect(-l / 2, -w / 2, l, w, 4);
        c.fill();
        rect(c, "#ffffff44", -l / 2 + 3, -w / 2 + 2, l - 7, 2);
        rect(c, "#a6d2cb", l * 0.04, -w / 2 + 3, l * 0.18, w - 6);
        rect(c, "#31535f", l * 0.055, -w / 2 + 4, l * 0.14, w - 8);
        rect(c, "#304f58", -l * 0.3, -w / 2 + 4, l * 0.15, w - 8);
        rect(
          c,
          v.police ? "#263c4a" : v.color,
          -l * 0.14,
          -w / 2 + 3,
          l * 0.19,
          w - 6,
        );
        rect(c, "#d1eee0", l / 2 - 3, -w / 2 + 3, 3, 5);
        rect(c, "#d1eee0", l / 2 - 3, w / 2 - 8, 3, 5);
        rect(c, "#db5e4c", -l / 2, -w / 2 + 3, 3, 5);
        rect(c, "#db5e4c", -l / 2, w / 2 - 8, 3, 5);
        line(c, "#213b4544", 1, l * 0.26, -w / 2 + 3, l * 0.26, w / 2 - 3);
        if (v.type === "taxi") {
          rect(c, "#eed785", -4, -6, 11, 12);
          rect(c, "#343e35", -2, -4, 6, 8);
        }
        if (v.type === "pickup")
          rect(c, "#5a797288", -l * 0.43, -w * 0.36, l * 0.3, w * 0.72);
        if (v.type === "bus") {
          for (let x = -l * 0.35; x < l * 0.25; x += 13)
            rect(c, "#95bcb9", x, -w * 0.35, 9, w * 0.7);
        }
        if (v.police) {
          rect(c, "#253c4d", -l * 0.45, -w * 0.44, l * 0.2, w * 0.88);
          rect(c, "#e86c5b", -3, -w / 2 + 2, 7, w / 2 - 2);
          rect(c, "#6bb6e0", -3, 0, 7, w / 2 - 2);
          ellipse(c, "#72b9e73b", 1, 9, 16, 17);
          ellipse(c, "#ff75612e", 1, -9, 16, 17);
        }
      }
      if (Math.abs(v.speed) > 240) {
        line(c, "#f9ecc788", 2, -l, -w / 2 - 5, -l / 2 - 8, -w / 2 - 5);
        line(c, "#f9ecc766", 1, -l - 20, w / 2 + 5, -l / 2 - 8, w / 2 + 5);
      }
    }
    c.restore();
  }
  function drawHelicopterBody(c, g, color) {
    rect(c, "#354b4b", -68, -4, 54, 8);
    rect(c, color, -66, -3, 52, 6);
    line(c, "#263e43", 3, -60, -17, -60, 17);
    ellipse(c, "#324c51", -3, 0, 31, 17);
    ellipse(c, color, 0, 0, 28, 14);
    ellipse(c, "#75afb8", 16, 0, 12, 12);
    line(c, "#2b4448", 2, -25, -20, 20, -20);
    line(c, "#2b4448", 2, -25, 20, 20, 20);
    c.save();
    c.rotate(g.elapsed * 28);
    line(c, "#213d4a8a", 5, -71, 0, 71, 0);
    line(c, "#213d4a8a", 5, 0, -71, 0, 71);
    line(c, "#fff5cb8a", 2, -70, 2, 70, 2);
    c.restore();
    ellipse(c, "#e5d5b5", 0, 0, 5, 5);
  }
  function drawPerson(c, p, g, police = false, player = false) {
    if (p.hp <= 0) return;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.angle || 0);
    ellipse(c, "#233a3a35", 4, 5, 8, 5);
    rect(c, "#35484b", -9, -5, 10, 4);
    rect(c, "#35484b", -9, 3, 10, 4);
    ellipse(c, "#b98a64", 0, -8, 3, 3);
    ellipse(c, "#b98a64", 0, 8, 3, 3);
    ellipse(
      c,
      player ? "#e8e0c1" : police ? "#345d72" : p.color || "#93618c",
      0,
      0,
      6,
      9,
    );
    ellipse(c, "#b78462", 2, 0, 4, 4);
    ellipse(c, player ? "#3b3539" : "#604d40", 0, 0, 4, 4);
    if (player || police) {
      rect(c, player ? "#e0b78b" : "#365a6b", 5, -5, 10, 4);
      rect(c, "#263a3d", 12, -5, 11, 3);
    }
    c.restore();
    if (player) {
      c.strokeStyle = "#fff0ba99";
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(p.x, p.y, 17, 0, TAU);
      c.stroke();
    }
  }
  function label(c, g, x, y, text, color = "#f4e5bb", size = 13, sub = "") {
    const sx = x - g.camera.x + 640;
    const sy = y - g.camera.y + 360;
    c.font = "bold " + size + "px sans-serif";
    const width = Math.max(
      c.measureText(text).width + 28,
      sub.length * 5.6 + 20,
    );
    // Reserve every HUD region and the dialogue rectangle.
    if (
      sx - width / 2 < 30 ||
      sx + width / 2 > 1245 ||
      sy < 176 ||
      sy > 458 ||
      (sx > 1000 && sy < 220) ||
      (g.dialogue && sy > 400)
    )
      return;
    rect(c, "#12353deb", x - width / 2, y - 23, width, sub ? 47 : 34);
    c.shadowBlur = 7;
    c.shadowColor = color;
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.strokeRect(x - width / 2 + 4, y - 19, width - 8, sub ? 39 : 26);
    c.shadowBlur = 0;
    rect(c, color, x - width / 2, y - 23, 3, sub ? 47 : 34);
    c.textAlign = "center";
    c.fillStyle = color;
    c.fillText(text, x, y - 1);
    if (sub) {
      c.font = "9px monospace";
      c.fillStyle = "#d4d9ca";
      c.fillText(sub, x, y + 14);
    }
    c.textAlign = "left";
  }
  function render(c, g) {
    c.clearRect(0, 0, 1280, 720);
    c.save();
    let shakeX = 0;
    let shakeY = 0;
    if (g.shake > 0 && !g.shot) {
      shakeX = Math.sin(g.elapsed * 73) * g.shake;
      shakeY = Math.cos(g.elapsed * 67) * g.shake;
    }
    c.translate(640 - g.camera.x + shakeX, 360 - g.camera.y + shakeY);
    drawGround(c, g);
    for (const s of g.skids) {
      c.save();
      c.translate(s.x, s.y);
      c.rotate(s.angle);
      rect(c, "#253e3d55", -5, -10, 13, 3);
      rect(c, "#253e3d55", -5, 8, 13, 3);
      c.restore();
    }
    for (const b of buildings)
      if (visible(g, b.x + b.w / 2, b.y + b.h / 2)) drawBuilding(c, b);
    // A purpose-built tiled casino forecourt leaves a clear route to the vault door.
    rect(c, "#b69f79", 1328, 813, 330, 165);
    rect(c, "#eddbb5", 1335, 818, 316, 151);
    for (let y = 830; y < 965; y += 24) {
      for (let x = 1345; x < 1645; x += 24) {
        c.save();
        c.translate(x, y);
        c.rotate(Math.PI / 4);
        rect(c, "#cdbb94", -3, -3, 6, 6);
        c.restore();
      }
    }
    rect(c, "#b47a68", 1460, 816, 38, 70);
    rect(c, "#efcb7a", 1463, 816, 3, 70);
    rect(c, "#efcb7a", 1492, 816, 3, 70);
    for (const x of [1355, 1625]) {
      for (const y of [846, 942]) {
        rect(c, "#b09a76", x - 15, y - 12, 30, 24);
        ellipse(c, "#4e8e70", x, y, 14, 13);
        ellipse(c, "#8cb389", x - 3, y - 4, 8, 8);
      }
    }
    // Planters, benches and streetlights fill the sidewalks.
    for (const p of props) {
      if (!visible(g, p.x, p.y, 50)) continue;
      rect(c, "#8d7657", p.x - 12, p.y, 25, 6);
      rect(c, "#b79b6a", p.x - 12, p.y - 3, 25, 3);
      line(c, "#3d5655", 2, p.x + 25, p.y - 3, p.x + 25, p.y - 28);
      rect(c, "#f0e3be", p.x + 18, p.y - 30, 14, 5);
      rect(c, "#4d7975", p.x - 34, p.y - 1, 8, 9);
    }
    for (const t of trees) if (visible(g, t.x, t.y, 40)) drawTree(c, t);
    for (const jump of g.jumps) {
      if (!visible(g, jump.x, jump.y)) continue;
      rect(c, "#c1ab85", jump.x - 15, jump.y - 26, 30, 52);
      for (let i = -20; i < 25; i += 10)
        line(c, "#f7dd8a", 3, jump.x - 12, jump.y + i, jump.x + 12, jump.y + i);
    }
    for (const v of g.vehicles)
      if (visible(g, v.x, v.y, 100) && !v.air) drawVehicle(c, v, g);
    for (const p of g.pedestrians)
      if (visible(g, p.x, p.y, 20)) drawPerson(c, p, g);
    for (const p of g.officers) drawPerson(c, p, g, true);
    for (const p of g.enemies) drawPerson(c, p, g);
    if (g.sideJob?.type === "taxi" && g.sideJob.step === 0) {
      drawPerson(
        c,
        {
          x: g.sideJob.x,
          y: g.sideJob.y,
          hp: 100,
          color: "#d9a2bb",
          angle: 1.4,
        },
        g,
      );
    }
    if (g.mission?.index === 8 && g.mission.step >= 1) {
      const waiting = g.mission.step === 1;
      const lena = {
        x: waiting ? 3970 : g.player.x - 25,
        y: waiting ? 3060 : g.player.y + 12,
        hp: 100,
        color: "#b6d5ac",
        angle: g.player.angle,
      };
      if (waiting || !g.player.vehicle) drawPerson(c, lena, g);
    }
    if (!g.player.vehicle)
      drawPerson(c, { ...g.player, hp: 100 }, g, false, true);
    for (const p of [
      ...g.pickups,
      ...g.packages
        .filter((p) => !p.collected)
        .map((p) => ({ ...p, type: "package" })),
    ]) {
      if (!visible(g, p.x, p.y, 20)) continue;
      ellipse(c, "#ffe9a62b", p.x, p.y, 19, 19);
      rect(
        c,
        p.type === "package" ? "#b39aca" : "#f5e5b6",
        p.x - 6,
        p.y - 6,
        12,
        12,
      );
      line(c, "#fff3d2", 2, p.x, p.y - 6, p.x, p.y + 6);
      line(c, "#fff3d2", 2, p.x - 6, p.y, p.x + 6, p.y);
    }
    const target = g.sideJob || missionTarget(g);
    if (target && visible(g, target.x, target.y)) {
      c.strokeStyle = "#ffe49d";
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(
        target.x,
        target.y,
        31 + Math.sin(g.elapsed * 3) * 3,
        18,
        0,
        0,
        TAU,
      );
      c.stroke();
      c.fillStyle = "#ffe6a94d";
      c.fill();
      c.fillStyle = "#ffebad";
      c.beginPath();
      c.moveTo(target.x, target.y - 38);
      c.lineTo(target.x - 7, target.y - 50);
      c.lineTo(target.x + 7, target.y - 50);
      c.fill();
    }
    for (const s of signs)
      if (visible(g, s.x, s.y))
        label(c, g, s.x, s.y, s.text, s.color, 18, s.sub);
    for (const s of shops)
      if (visible(g, s.x, s.y))
        label(
          c,
          g,
          s.x,
          s.y - 34,
          s.name,
          s.color,
          12,
          "[E] " + s.type.toUpperCase(),
        );
    for (const b of g.bullets)
      line(
        c,
        b.enemy ? "#fa9772" : "#fff6ae",
        2,
        b.x,
        b.y,
        b.x - b.vx * 0.012,
        b.y - b.vy * 0.012,
      );
    for (const p of g.particles) {
      c.globalAlpha = Math.min(1, p.life * 2);
      ellipse(c, p.color, p.x, p.y, p.size, p.size);
    }
    c.globalAlpha = 1;
    const heli = g.policeHeli;
    if (heli) {
      ellipse(c, "#28434b35", heli.x + 40, heli.y + 75, 61, 22);
      c.fillStyle = "#fff8c14d";
      c.beginPath();
      c.moveTo(heli.x + 16, heli.y + 6);
      c.lineTo(heli.x + 130, heli.y + 183);
      c.quadraticCurveTo(heli.x + 60, heli.y + 205, heli.x + 15, heli.y + 168);
      c.closePath();
      c.fill();
      ellipse(c, "#fff7b343", heli.x + 74, heli.y + 176, 59, 24);
      c.save();
      c.translate(heli.x, heli.y);
      c.rotate(heli.angle);
      drawHelicopterBody(c, g, "#e0dfcb");
      c.restore();
    }
    for (const v of g.vehicles.filter((v) => v.air)) {
      ellipse(c, "#203b4344", v.x + 35, v.y + 60, 60, 22);
      drawVehicle(c, v, g);
    }
    c.restore();
    if (!g.shot) {
      const hour = g.clock / 60;
      const night = hour > 19 || hour < 6 ? 0.48 : hour > 17 ? 0.14 : 0;
      rect(c, "rgba(14,30,62," + night + ")", 0, 0, 1280, 720);
      if (g.rain) {
        rect(c, "#29495725", 0, 0, 1280, 720);
        for (let i = 0; i < 100; i++) {
          const x = (i * 131 + g.elapsed * 95) % 1300;
          const y = (i * 73 + g.elapsed * 470) % 740;
          line(c, "#e3f7ee66", 1, x, y, x - 5, y + 13);
        }
      }
    }
    drawHUD(c, g);
  }

  Object.assign(window.Solstice, { drawVehicle, render });
})();
