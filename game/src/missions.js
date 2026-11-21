(() => {
  "use strict";
  const { distance, openDialogue, makeVehicle } = window.Solstice;

  const step = (text, x, y, mode = "", heat = 0) => ({
    text,
    x,
    y,
    mode,
    heat,
  });
  const missionList = [
    {
      name: "A debt in sunlight",
      contact: "Inez Vale",
      role: "THE FIXER",
      payout: 1200,
      intro:
        "Maya Reyes. Still the best hands on the coast? Take the orange Vela across the causeway. My ledger is in its glovebox. Keep it away from Bay Patrol.",
      steps: [
        step("Take the orange Vela • E to enter", 820, 1100, "car"),
        step("Lose the tail on the Solstice Causeway", 2690, 1520, "car", 2),
        step("Deliver the ledger to the east toll house", 3290, 1650, "car"),
      ],
    },
    {
      name: "House money",
      contact: "Jules Sato",
      role: "THE INSIDE MAN",
      payout: 2200,
      intro:
        "The Gilded Tide counts every chip except the ones in the private vault. I left the service entrance open. Get the case, then disappear into Old Town.",
      steps: [
        step("Enter the Gilded Tide service courtyard", 1490, 900),
        step("Crack the chip vault • hold E", 1480, 858, "interact", 3),
        step("Escape with the chip case to Old Town", 580, 1920),
      ],
    },
    {
      name: "Saltwater receipts",
      contact: "Nessa Cruz",
      role: "THE SKIPPER",
      payout: 2600,
      intro:
        "Our courier sold the manifest. Borrow a Marlin from Pearl Marina, follow the buoys and intercept the exchange. The bay is wide. Use it.",
      steps: [
        step("Board a boat at Pearl Marina", 2100, 2630, "boat"),
        step("Chase the courier past the north buoy", 2700, 2250, "boat", 2),
        step("Recover the floating manifest", 2910, 1850, "boat"),
        step("Return to Pearl Marina", 2110, 2630, "boat"),
      ],
    },
    {
      name: "Meter running",
      contact: "Oz Bell",
      role: "THE DISPATCHER",
      payout: 1800,
      intro:
        "Three fares. No questions. Take a yellow cab, collect my guest outside Palma, then head to the university. A quiet shift pays surprisingly well.",
      steps: [
        step("Collect a Bayline taxi", 420, 1110, "taxi"),
        step("Pick up Oz’s guest outside Palma", 590, 520, "taxi"),
        step("Drop the guest at Verdant University", 780, 330, "taxi"),
        step("Return the taxi to dispatch", 380, 1110, "taxi"),
      ],
    },
    {
      name: "Bad inventory",
      contact: "Nico Duran",
      role: "THE ARMORER",
      payout: 3400,
      intro:
        "Someone changed the port handoff. Bring armor. If their welcome is unfriendly, clear the crew and bring my serial-number book home.",
      steps: [
        step("Meet Nico at the east freight yard", 3440, 2520),
        step("Survive the ambush • clear the crew", 3520, 2520, "fight", 3),
        step("Return Nico’s book to the hardware shop", 680, 1430),
      ],
    },
    {
      name: "Last departure",
      contact: "Inez Vale",
      role: "THE FIXER",
      payout: 3900,
      intro:
        "The vault codes are leaving on a charter. Beat its escort down the runway and collect the pilot’s bag before the wheels leave the ground.",
      steps: [
        step("Reach Solstice Airfield in a fast car", 3380, 1020, "car"),
        step("Chase the escort down runway 09", 4360, 780, "car", 3),
        step("Intercept the pilot at the south hangar", 4360, 1450, "car"),
      ],
    },
    {
      name: "Borrowed sky",
      contact: "Nessa Cruz",
      role: "THE SKIPPER",
      payout: 4600,
      intro:
        "Roads are closed, Maya. The Kestrel on the airport pad still has fuel. Take it over the bay, then land beside the university observatory.",
      steps: [
        step("Steal the Kestrel from the helipad", 3510, 1150, "helicopter", 3),
        step(
          "Fly over the causeway search perimeter",
          2600,
          1520,
          "helicopter",
        ),
        step("Land at the university observatory", 1120, 300, "helicopter"),
      ],
    },
    {
      name: "Golden hour circuit",
      contact: "Tavi Knox",
      role: "THE RACER",
      payout: 4200,
      intro:
        "One lap of the west shore. Three gates, ninety seconds. Bring something that can turn. A stunt driver ought to make this look easy.",
      steps: [
        step("Bring a car to the Crown Mile starting line", 1280, 1020, "car"),
        step("Race gate 1 • Old Town", 280, 2020, "race"),
        step("Race gate 2 • the boardwalk", 1280, 3020, "race"),
        step("Finish at Crown Mile", 1280, 1020, "race"),
      ],
    },
    {
      name: "Someone comes home",
      contact: "Jules Sato",
      role: "THE INSIDE MAN",
      payout: 5000,
      intro:
        "They found out I helped. My sister is at the container terminal. Get her out, Maya. Forget the chips for once. This one matters.",
      steps: [
        step("Find Jules’s sister at the industrial port", 3900, 3020),
        step("Rescue Lena from the guards", 3970, 3020, "fight", 4),
        step("Take Lena to Reyes Motor Works", 380, 2110, "car"),
      ],
    },
    {
      name: "The sun owes us",
      contact: "Maya Reyes",
      role: "ONE LAST JOB",
      payout: 18000,
      intro:
        "We have the codes, the route and a city full of people the Tide owes. Jules opens the vault. Nessa takes the water. I drive. One last summer. Our terms.",
      steps: [
        step("Meet the crew at the Gilded Tide", 1490, 900),
        step("Open the casino vault • hold E", 1480, 858, "interact", 5),
        step("Carry the bonds across the causeway", 3100, 1520, "car"),
        step("Escape by helicopter", 3510, 1150, "helicopter"),
        step("Deliver the bonds to the university", 1120, 300, "helicopter"),
      ],
    },
  ];
  function beginMission(g, index = g.completed) {
    if (index > g.completed || index >= missionList.length) return;
    if (g.respect < Math.floor(index / 3) * 250) {
      g.message = "Build respect through jobs, packages and stunt jumps first";
      return;
    }
    const m = missionList[index];
    g.phone = false;
    g.mission = { index, step: 0, hold: 0, timer: 0, spawned: false };
    g.message = "Follow the gold GPS marker";
    openDialogue(g, m.contact, m.intro);
    g.audio.effect("pickup");
  }
  function missionTarget(g) {
    if (!g.mission)
      return {
        x: 910,
        y: 1100,
        text:
          g.completed < 10
            ? "Meet Inez • E to take a story job / P for phone"
            : "The summer is yours • explore Solstice Bay",
      };
    const target = missionList[g.mission.index].steps[g.mission.step];
    if (g.mission.chase && g.mission.step === 1)
      return { ...target, x: g.mission.chase.x, y: g.mission.chase.y };
    return target;
  }
  function updateMissions(g, dt) {
    if (!g.mission) return;
    const state = g.mission;
    const m = missionList[state.index];
    let target = m.steps[state.step];
    if (!target) return;
    // These pursuits run on the same drivable entities as free-play traffic.
    if ((state.index === 2 || state.index === 5) && state.step === 1) {
      if (!state.chase) {
        state.chase = makeVehicle(
          state.index === 2 ? "boat" : "sports",
          state.index === 2 ? 2660 : 4370,
          state.index === 2 ? 2250 : 680,
          state.index === 2 ? -0.7 : Math.PI / 2,
          "#9e80a9",
        );
        g.vehicles.push(state.chase);
      }
      const chase = state.chase;
      if (state.index === 2 && chase.x < 2900) {
        chase.x += Math.cos(chase.angle) * dt * 95;
        chase.y += Math.sin(chase.angle) * dt * 95;
        chase.speed = 95;
      }
      if (state.index === 5 && chase.y < 1370) {
        chase.y += dt * 125;
        chase.speed = 125;
      }
      target = { ...target, x: chase.x, y: chase.y };
    }
    if (state.index === 7 && state.step > 0) {
      const route = [
        { x: 1280, y: 2020 },
        { x: 280, y: 2020 },
        { x: 280, y: 3020 },
        { x: 1280, y: 3020 },
        { x: 1280, y: 1020 },
      ];
      if (!state.racers) {
        state.racers = [0, 1].map((i) => {
          const car = makeVehicle(
            "sports",
            1280 + i * 30,
            1090,
            Math.PI / 2,
            i ? "#84b1b4" : "#c39bcd",
          );
          car.checkpoint = 0;
          g.vehicles.push(car);
          return car;
        });
      }
      for (const car of state.racers) {
        const gate = route[car.checkpoint];
        if (!gate) {
          car.speed = 0;
          continue;
        }
        car.angle = Math.atan2(gate.y - car.y, gate.x - car.x);
        car.speed = 170;
        car.x += Math.cos(car.angle) * car.speed * dt;
        car.y += Math.sin(car.angle) * car.speed * dt;
        if (distance(car, gate) < 15) car.checkpoint++;
      }
    }
    if (target.mode === "race") {
      if (!state.timer) state.timer = 90;
      state.timer -= dt;
      if (state.timer <= dt) {
        g.mission = null;
        g.message = "Race lost • call Tavi to try again";
        return;
      }
    }
    if (distance(g.player, target) > (target.mode === "helicopter" ? 135 : 105))
      return;
    const v = g.player.vehicle;
    if (target.mode === "car" && (!v || v.water || v.air)) return;
    if (target.mode === "boat" && !v?.water) return;
    if (target.mode === "helicopter" && !v?.air) return;
    if (target.mode === "taxi" && v?.type !== "taxi") return;
    if (target.mode === "interact") {
      if (!g.input.down("KeyE")) {
        g.message = "Hold E to open the vault";
        return;
      }
      state.hold += dt;
      if (state.hold < 3) {
        g.message =
          "Decoding vault • " + Math.floor((state.hold / 3) * 100) + "%";
        return;
      }
    }
    if (target.mode === "fight") {
      if (!state.spawned) {
        state.spawned = true;
        g.enemies = [0, 1, 2].map((i) => ({
          x: target.x + 80,
          y: target.y - 65 + i * 65,
          hp: 70,
          cooldown: 1 + i * 0.3,
        }));
        g.crime(target.heat);
      }
      if (g.enemies.some((e) => e.hp > 0)) return;
    }
    if (target.heat) g.crime(target.heat);
    state.step++;
    state.hold = 0;
    state.spawned = false;
    g.audio.effect("pickup");
    if (state.step === m.steps.length) {
      g.cash += m.payout;
      g.respect += 100;
      if (!state.sideRace) g.completed = Math.max(g.completed, state.index + 1);
      g.completeScreen = { name: m.name, payout: m.payout };
      g.mission = null;
      g.save();
    }
  }

  Object.assign(window.Solstice, {
    missionList,
    beginMission,
    missionTarget,
    updateMissions,
  });
})();
