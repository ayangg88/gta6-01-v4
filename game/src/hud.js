(() => {
  "use strict";
  const {
    drawMinimap,
    missionList,
    missionTarget,
    weaponData,
    stations,
    hasSave,
  } = window.Solstice;

  const cream = "#f6eacf";
  const gold = "#f1c477";
  const navy = "#102f39";
  function panel(c, x, y, w, h, alpha = 0.95) {
    c.fillStyle = "rgba(12,39,48," + alpha + ")";
    c.fillRect(x, y, w, h);
  }
  function text(
    c,
    value,
    x,
    y,
    size = 14,
    color = cream,
    weight = "normal",
    font = "sans-serif",
  ) {
    c.fillStyle = color;
    c.font = weight + " " + size + "px " + font;
    c.fillText(value, x, y);
  }
  function button(c, g, value, x, y, w, action, selected = false) {
    const m = g.input.mouse;
    const hover = m.x > x && m.x < x + w && m.y > y && m.y < y + 41;
    c.fillStyle = selected || hover ? gold : "#254751";
    c.fillRect(x, y, w, 41);
    text(
      c,
      value,
      x + 15,
      y + 27,
      14,
      selected || hover ? navy : cream,
      "bold",
    );
    g.uiButtons.push({ x, y, w, h: 41, action });
  }
  function wrap(
    c,
    value,
    x,
    y,
    maxWidth,
    lineHeight,
    size = 17,
    color = cream,
  ) {
    c.font = "normal " + size + "px sans-serif";
    c.fillStyle = color;
    let line = "";
    let count = 0;
    for (const word of value.split(" ")) {
      const next = line + word + " ";
      if (c.measureText(next).width > maxWidth && line) {
        c.fillText(line, x, y + count * lineHeight);
        count++;
        line = word + " ";
      } else line = next;
    }
    c.fillText(line, x, y + count * lineHeight);
    return count + 1;
  }
  function titleScreen(c, g) {
    const gradient = c.createLinearGradient(0, 0, 1000, 0);
    gradient.addColorStop(0, "#0e3039fa");
    gradient.addColorStop(0.62, "#103640ef");
    gradient.addColorStop(1, "#10364000");
    c.fillStyle = gradient;
    c.fillRect(0, 0, 1280, 720);
    text(
      c,
      "AN OPEN-WORLD SUMMER CRIME STORY",
      66,
      86,
      12,
      gold,
      "bold",
      "monospace",
    );
    text(c, "SOLSTICE", 60, 172, 79, cream, "900");
    text(c, "HEAT", 60, 254, 103, "#f18b64", "900");
    c.fillStyle = gold;
    c.fillRect(66, 282, 76, 4);
    wrap(
      c,
      "Maya Reyes left the stunt life behind. Solstice Bay has one last summer of debts, dangerous friends and impossible getaways waiting for her.",
      66,
      322,
      485,
      25,
      17,
      "#d2ddce",
    );
    for (let i = 1; i <= 3; i++)
      button(
        c,
        g,
        "SLOT " + i + (hasSave(i) ? " • SAVED" : " • NEW"),
        66 + (i - 1) * 158,
        411,
        148,
        "slot-" + i,
        g.slot === i,
      );
    button(c, g, "NEW SUMMER  →", 66, 467, 224, "new", true);
    button(
      c,
      g,
      hasSave(g.slot) ? "CONTINUE  →" : "ENTER TO START",
      306,
      467,
      224,
      "continue",
    );
    text(
      c,
      "WASD / ARROWS  Move & drive     E  Enter / interact",
      66,
      561,
      13,
      "#d2ddce",
      "normal",
      "monospace",
    );
    text(
      c,
      "MOUSE  Aim & fire     1–3  Weapons     SPACE  Drift",
      66,
      587,
      13,
      "#d2ddce",
      "normal",
      "monospace",
    );
    text(
      c,
      "P  Phone     R  Radio     M  Mute     ESC  Pause",
      66,
      613,
      13,
      "#d2ddce",
      "normal",
      "monospace",
    );
    text(
      c,
      "SHIFT  Sprint     F5  Save     F9  Load selected slot",
      66,
      639,
      13,
      "#d2ddce",
      "normal",
      "monospace",
    );
    text(
      c,
      "SOLSTICE BAY  /  EVERY ROAD IS A WAY OUT.",
      66,
      686,
      10,
      gold,
      "bold",
      "monospace",
    );
  }
  function drawDialogue(c, g) {
    const d = g.dialogue;
    panel(c, 280, 456, 718, 163, 0.98);
    c.fillStyle = gold;
    c.fillRect(280, 456, 4, 163);
    panel(c, 300, 479, 66, 86);
    // A simple original portrait of the contact, drawn in the game renderer.
    c.fillStyle = "#ba8869";
    c.beginPath();
    c.ellipse(333, 508, 15, 20, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#2c3e44";
    c.beginPath();
    c.ellipse(333, 496, 16, 9, -0.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#688f8c";
    c.fillRect(311, 532, 44, 26);
    text(c, d.speaker.toUpperCase(), 387, 488, 13, gold, "bold", "monospace");
    wrap(c, d.text.slice(0, Math.floor(d.shown)), 387, 517, 583, 24, 17);
    text(
      c,
      "SPACE / E  " + (d.shown < d.text.length ? "REVEAL" : "CONTINUE") + "  →",
      786,
      600,
      10,
      "#a8bfba",
      "bold",
      "monospace",
    );
  }
  function drawPhone(c, g) {
    panel(c, 391, 90, 498, 552, 0.99);
    text(c, "BAYLINK", 418, 126, 24, gold, "900");
    text(c, "CONTACTS & JOBS", 669, 124, 11, "#9bb7b4", "bold", "monospace");
    for (let i = 0; i < missionList.length; i++) {
      const m = missionList[i];
      const y = 147 + i * 39;
      const unlocked = i <= g.completed && g.respect >= Math.floor(i / 3) * 250;
      c.fillStyle = i < g.completed ? "#264d4f" : "#1b3d47";
      c.fillRect(413, y, 454, 34);
      text(
        c,
        (i < g.completed ? "✓ " : String(i + 1).padStart(2, "0") + " ") +
          m.name,
        426,
        y + 22,
        13,
        unlocked ? cream : "#728b8d",
        "bold",
      );
      text(
        c,
        unlocked ? "$" + m.payout : "LOCKED",
        794,
        y + 22,
        11,
        unlocked ? gold : "#728b8d",
        "bold",
        "monospace",
      );
      if (unlocked)
        g.uiButtons.push({ x: 413, y, w: 454, h: 34, action: "mission-" + i });
    }
    button(c, g, "TAVI • FREE STREET RACE", 413, 548, 275, "race");
    button(c, g, "CLOSE [P]", 700, 548, 167, "close");
    text(
      c,
      "INEZ / JULES / NESSA / OZ / NICO / TAVI",
      420,
      616,
      11,
      "#91b4b0",
      "normal",
      "monospace",
    );
  }
  function drawHUD(c, g) {
    g.uiButtons = [];
    if (!g.started) {
      titleScreen(c, g);
      return;
    }
    panel(c, 28, 24, 301, 82);
    c.fillStyle = gold;
    c.fillRect(28, 24, 4, 82);
    text(c, "SOLSTICE", 46, 57, 28, cream, "900");
    text(c, "HEAT", 207, 57, 28, "#f58c66", "900");
    text(c, "MAYA REYES", 47, 83, 11, "#9fc4bc", "bold", "monospace");
    const rank = ["OUTSIDER", "WHEELHAND", "LOCAL LEGEND", "BAY ROYALTY"][
      Math.min(3, Math.floor(g.respect / 250))
    ];
    text(c, rank, 174, 83, 10, gold, "bold", "monospace");
    const district =
      g.stagedTitle ||
      (g.player.x > 3180
        ? "EAST SOLSTICE"
        : g.player.x > 2020
          ? "SOLSTICE BAY"
          : g.player.y > 2300
            ? "PEARL COAST"
            : g.player.y < 1300
              ? "CROWN MILE"
              : "OLD SOLSTICE");
    text(c, district, 29, 143, 21, navy, "900");
    text(
      c,
      g.stagedSubtitle || "SUNSHINE STATE OF MIND",
      30,
      162,
      10,
      "#244d51",
      "bold",
      "monospace",
    );
    panel(c, 943, 24, 309, 116);
    text(
      c,
      "$" + g.cash.toLocaleString("en-US"),
      962,
      56,
      27,
      "#a5e1c0",
      "bold",
      "monospace",
    );
    const hours = Math.floor(g.clock / 60) % 24;
    const minutes = Math.floor(g.clock % 60);
    text(
      c,
      String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0"),
      1182,
      53,
      14,
      cream,
      "bold",
      "monospace",
    );
    text(c, "♥", 962, 82, 17, "#f18e7d");
    c.fillStyle = "#4a5553";
    c.fillRect(985, 72, 109, 8);
    c.fillStyle = "#e78877";
    c.fillRect(985, 72, g.player.health * 1.09, 8);
    text(c, "◆", 1111, 82, 17, "#9dcacb");
    c.fillStyle = "#4a5553";
    c.fillRect(1134, 72, 99, 8);
    c.fillStyle = "#9dcacb";
    c.fillRect(1134, 72, g.player.armor * 0.99, 8);
    const wanted = Math.ceil(g.heat);
    for (let i = 0; i < 5; i++)
      text(
        c,
        "★",
        962 + i * 35,
        121,
        27,
        i < wanted ? "#f8ce7d" : "#47616a",
        "bold",
      );
    text(
      c,
      wanted ? (g.seen || g.shot ? "PURSUIT" : "SEARCH") : "CLEAR",
      1157,
      116,
      10,
      wanted ? "#f09b7c" : "#9bc8b6",
      "bold",
      "monospace",
    );
    if (g.mission) {
      const m = missionList[g.mission.index];
      panel(c, 372, 24, 532, 62, 0.9);
      text(
        c,
        "STORY " +
          String(g.mission.index + 1).padStart(2, "0") +
          " / " +
          m.contact.toUpperCase(),
        391,
        47,
        10,
        gold,
        "bold",
        "monospace",
      );
      text(c, m.name.toUpperCase(), 391, 73, 20, cream, "bold");
    }
    drawMinimap(c, g);
    panel(c, 280, 640, 772, 52);
    c.fillStyle = gold;
    c.fillRect(280, 640, 4, 52);
    text(c, "◆", 298, 672, 20, gold);
    const target = g.sideJob || missionTarget(g);
    const objective = target.text;
    text(c, objective, 329, 671, 17, cream, "bold");
    if (g.mission?.timer)
      text(
        c,
        Math.ceil(g.mission.timer) + "s",
        974,
        672,
        20,
        gold,
        "bold",
        "monospace",
      );
    const v = g.player.vehicle;
    if (v) {
      panel(c, 1071, 530, 181, 162);
      text(
        c,
        v.water ? "WATERCRAFT" : v.air ? "AIRBORNE" : "ROAD SPEED",
        1089,
        552,
        10,
        "#9fbfbd",
        "bold",
        "monospace",
      );
      text(
        c,
        String(Math.round(Math.abs(v.speed) * 0.36)).padStart(3, "0"),
        1084,
        609,
        57,
        cream,
        "bold",
        "monospace",
      );
      text(c, "KM/H", 1197, 607, 11, gold, "bold", "monospace");
      text(c, v.name.toUpperCase(), 1089, 632, 11, gold, "bold");
      c.fillStyle = "#40565b";
      c.fillRect(1089, 648, 144, 5);
      c.fillStyle = "#94c5ae";
      c.fillRect(
        1089,
        648,
        144 * Math.max(0, v.hp / (v.type === "armored" ? 260 : 100)),
        5,
      );
      text(
        c,
        "R  " + stations[g.audio.station].name,
        1089,
        677,
        9,
        "#a7c1bd",
        "bold",
        "monospace",
      );
    } else {
      panel(c, 1071, 574, 181, 118);
      text(c, weaponData[g.player.weapon].name, 1089, 601, 16, cream, "bold");
      text(
        c,
        String(g.player.ammo[g.player.weapon]),
        1087,
        643,
        37,
        gold,
        "bold",
        "monospace",
      );
      text(c, "ROUNDS", 1168, 642, 10, "#9dbbb7", "bold", "monospace");
      text(
        c,
        "1 / 2 / 3   SWITCH",
        1089,
        677,
        10,
        "#a6c4bd",
        "normal",
        "monospace",
      );
    }
    if (!g.dialogue && g.message) {
      panel(c, 280, 601, 718, 28, 0.79);
      text(c, g.message, 294, 620, 12, "#e0e5cc");
    }
    text(
      c,
      "P  PHONE     ESC  PAUSE     " +
        (g.audio.muted ? "M  UNMUTE" : "M  MUTE"),
      29,
      705,
      10,
      navy,
      "bold",
      "monospace",
    );
    if (g.dialogue) drawDialogue(c, g);
    if (g.phone) drawPhone(c, g);
    if (g.shop) {
      panel(c, 376, 170, 528, 382, 0.99);
      text(
        c,
        g.shop === "arms" ? "NICO’S HARDWARE" : "REYES MOTOR WORKS",
        407,
        214,
        25,
        gold,
        "bold",
      );
      text(
        c,
        "CASH  $" + g.cash.toLocaleString("en-US"),
        407,
        245,
        14,
        "#acd3bc",
        "bold",
        "monospace",
      );
      const labels =
        g.shop === "arms"
          ? [
              "Pistol / 100 rounds — $180",
              "Shotgun / 28 shells — $900",
              "SMG / 100 rounds — $1,900 • 250 respect",
              "Body armor — $450",
            ]
          : [
              "Store / retrieve personal vehicle — FREE",
              "Buy Vela S6 — $6,500",
              "Buy Rumbler GT — $4,600",
              "Buy Wasp 900 — $2,100",
            ];
      labels.forEach((name, index) =>
        button(c, g, name, 406, 266 + index * 49, 468, "buy-" + index),
      );
      button(c, g, "BACK TO THE CITY  [ESC]", 406, 472, 468, "close", true);
    }
    if (g.paused) {
      panel(c, 0, 0, 1280, 720, 0.7);
      panel(c, 416, 135, 448, 442, 0.99);
      text(c, "SUMMER ON HOLD", 449, 187, 27, gold, "bold");
      text(
        c,
        "SLOT " + g.slot + "  /  " + g.respect + " RESPECT",
        449,
        221,
        13,
        cream,
        "bold",
        "monospace",
      );
      button(c, g, "RESUME [ESC]", 449, 250, 382, "resume", true);
      button(c, g, "SAVE THIS SUMMER [F5]", 449, 304, 382, "save");
      button(c, g, "LOAD SAVED SUMMER [F9]", 449, 358, 382, "load");
      button(c, g, "RETURN TO TITLE", 449, 412, 382, "title");
      text(
        c,
        "20 PACKAGES / " +
          g.packages.filter((p) => p.collected).length +
          " FOUND",
        449,
        493,
        12,
        "#9ebeb6",
        "bold",
        "monospace",
      );
      text(c, "WASD drive • SPACE drift • E enter/exit", 449, 527, 12, cream);
    }
    if (g.completeScreen || g.gameOver) {
      panel(c, 0, 0, 1280, 720, 0.72);
      panel(c, 335, 222, 610, 276, 0.99);
      const success = !!g.completeScreen;
      text(
        c,
        success ? "JOB COMPLETE" : g.gameOver,
        375,
        283,
        42,
        success ? gold : "#f09178",
        "900",
      );
      text(
        c,
        success
          ? g.completeScreen.name.toUpperCase()
          : "The bay gives everyone another chance.",
        375,
        326,
        20,
        cream,
        "bold",
      );
      text(
        c,
        success
          ? "+$" +
              g.completeScreen.payout.toLocaleString("en-US") +
              "   /   +100 RESPECT"
          : "Medical / legal fees paid. Your story continues.",
        375,
        366,
        16,
        "#a6cdb8",
        "bold",
        "monospace",
      );
      button(
        c,
        g,
        success ? "BACK TO SOLSTICE BAY  →" : "WAKE UP AT REYES MOTOR WORKS  →",
        375,
        408,
        530,
        success ? "complete" : "respawn",
        true,
      );
    }
  }

  Object.assign(window.Solstice, { drawHUD });
})();
