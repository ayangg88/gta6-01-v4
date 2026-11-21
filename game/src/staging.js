(() => {
  "use strict";
  const { makeVehicle, openDialogue } = window.Solstice;

  function stageScene(g, shot) {
    g.started = true;
    g.shot = shot;
    g.clock = 12 * 60 + 5;
    g.elapsed = 18;
    g.message = "";
    g.cash = 12840;
    g.respect = 420;
    g.vehicles = [];
    g.pedestrians = [];
    const add = (type, x, y, angle, color, police = false) => {
      const v = makeVehicle(type, x, y, angle, color);
      v.police = police;
      v.stolen = true;
      g.vehicles.push(v);
      return v;
    };
    const people = (x, y, count, horizontal = true) => {
      const colors = ["#f2a766", "#fff3d7", "#5e8eae", "#cf6886", "#58aa9e"];
      for (let i = 0; i < count; i++) {
        g.pedestrians.push({
          x: x + (horizontal ? i * 43 : (i % 2) * 23),
          y: y + (horizontal ? (i % 3) * 12 : i * 34),
          angle: i % 2 ? 0 : Math.PI,
          color: colors[i % 5],
          hp: 50,
          fear: 0,
        });
      }
    };
    if (shot === "chase") {
      g.camera = { x: 2580, y: 1500 };
      g.player.vehicle = add("sports", 2580, 1543, -0.055, "#f0713f");
      g.player.vehicle.speed = 370;
      add("police", 2390, 1545, -0.03, "#e9ebdf", true);
      add("police", 2460, 1494, 0.1, "#eceadf", true);
      add("police", 2240, 1548, 0, "#e9ebdf", true);
      add("van", 2790, 1494, Math.PI, "#9fc4bd");
      add("taxi", 2920, 1494, Math.PI, "#eac252");
      add("sedan", 2180, 1494, Math.PI, "#a9809e");
      add("pickup", 3150, 1543, 0, "#6b969d");
      add("boat", 2400, 1760, -0.3, "#fbf0d5");
      add("boat", 2830, 1750, -2.8, "#f3a072");
      add("jetski", 2710, 1260, 0.25, "#f4cd63");
      g.policeHeli = { x: 2650, y: 1320, angle: 0.23 };
      g.heat = 4;
      g.mission = { index: 0, step: 1, hold: 0 };
      g.stagedTitle = "SOLSTICE CAUSEWAY";
      g.stagedSubtitle = "THE BAY NEVER KEEPS A SECRET";
      for (let i = 0; i < 22; i++)
        g.skids.push({
          x: 2350 + i * 10,
          y: 1540 + Math.sin(i / 6) * 9,
          angle: 0,
          life: 20,
        });
    } else if (shot === "street") {
      g.camera = { x: 1030, y: 970 };
      g.player.x = 1090;
      g.player.y = 1100;
      const types = [
        "taxi",
        "sedan",
        "sports",
        "muscle",
        "van",
        "limo",
        "pickup",
        "motorcycle",
        "bus",
        "sedan",
        "taxi",
        "sports",
      ];
      const colors = [
        "#f2c85a",
        "#a3bab8",
        "#e36f4e",
        "#7aa2bf",
        "#e8ddbf",
        "#9b698e",
      ];
      types.forEach((type, i) =>
        add(
          type,
          515 + (i % 6) * 177,
          i < 6 ? 1043 : 997,
          i < 6 ? 0 : Math.PI,
          colors[i % 6],
        ),
      );
      for (let i = 0; i < 6; i++)
        add(
          types[i],
          i < 3 ? 828 : 1328,
          775 + (i % 3) * 104,
          Math.PI / 2,
          colors[(i + 2) % 6],
        );
      people(575, 934, 19);
      people(620, 1102, 18);
      people(704, 775, 6, false);
      people(1362, 792, 7, false);
      g.stagedTitle = "CROWN MILE";
      g.stagedSubtitle = "CASINO STRIP / WEST SOLSTICE";
      g.message = "E  Enter vehicle    •    P  Open phone    •    R  Radio";
    } else if (shot === "mission") {
      g.camera = { x: 1470, y: 835 };
      g.player.x = 1470;
      g.player.y = 887;
      add("limo", 1328, 958, Math.PI / 2, "#614f65");
      add("sports", 1778, 917, -Math.PI / 2, "#ed8b58");
      add("police", 1770, 1045, 0, "#e8e6da", true);
      add("taxi", 1260, 1045, 0, "#eccc55");
      people(1120, 941, 10);
      people(1765, 720, 6, false);
      g.enemies.push(
        { x: 1600, y: 899, hp: 70, cooldown: 1 },
        { x: 1380, y: 887, hp: 70, cooldown: 1 },
      );
      g.heat = 2;
      g.mission = { index: 1, step: 1, hold: 0 };
      openDialogue(
        g,
        "Jules Sato",
        "Service door is open. The chip vault is beneath the gold awning. Three seconds on the lock, Maya. Then we leave the house with its own money.",
      );
      g.dialogue.shown = g.dialogue.text.length;
      g.stagedTitle = "THE GILDED TIDE";
      g.stagedSubtitle = "VAULT QUARTER / STORY JOB 02";
    } else {
      g.camera = { x: 2180, y: 2640 };
      g.player.vehicle = add("boat", 2300, 2615, -0.27, "#ed8051");
      g.player.vehicle.speed = 312;
      const patrol = add("boat", 2100, 2705, -0.3, "#e9efe1", true);
      patrol.speed = 220;
      add("sports", 1780, 2480, -Math.PI / 2, "#ef7548").speed = 280;
      add("taxi", 1810, 2690, Math.PI / 2, "#f1cb5a");
      add("van", 1728, 2560, Math.PI / 2, "#a3b9ba");
      add("boat", 2110, 2930, -Math.PI / 2, "#f4d88b");
      add("jetski", 2510, 2790, -0.6, "#f4dc81");
      add("boat", 2710, 2440, Math.PI / 2, "#c8e5e4");
      people(1880, 2485, 8, false);
      g.heat = 3;
      g.mission = { index: 2, step: 1, hold: 0 };
      // A lively mooring basin around the pursuit keeps the waterfront readable.
      add("boat", 2110, 2558, -Math.PI / 2, "#82adb5");
      add("boat", 2170, 2557, -Math.PI / 2, "#e9c67a");
      add("boat", 2050, 2912, -Math.PI / 2, "#b08ea6");
      add("jetski", 2180, 2900, Math.PI / 2, "#77c5b0");
      g.stagedTitle = "PEARL MARINA";
      g.stagedSubtitle = "SALTWATER RECEIPTS / THE PURSUIT";
    }
    if (g.player.vehicle) {
      g.player.x = g.player.vehicle.x;
      g.player.y = g.player.vehicle.y;
      g.player.angle = g.player.vehicle.angle;
    }
  }

  Object.assign(window.Solstice, { stageScene });
})();
