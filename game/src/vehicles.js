(() => {
  "use strict";
  const { clamp, distance, angleDifference, random, isSolid, isWater, burst } =
    window.Solstice;

  const vehicleTypes = {
    sedan: {
      name: "Lumen Four",
      length: 48,
      width: 25,
      max: 260,
      accel: 135,
      price: 1600,
    },
    taxi: {
      name: "Bayline Taxi",
      length: 49,
      width: 25,
      max: 245,
      accel: 130,
      price: 2200,
    },
    pickup: {
      name: "Mesa Hauler",
      length: 54,
      width: 27,
      max: 235,
      accel: 115,
      price: 2600,
    },
    sports: {
      name: "Vela S6",
      length: 48,
      width: 25,
      max: 440,
      accel: 230,
      price: 6500,
    },
    van: {
      name: "Cargo Finch",
      length: 57,
      width: 29,
      max: 220,
      accel: 100,
      price: 3000,
    },
    police: {
      name: "Bay Patrol",
      length: 51,
      width: 26,
      max: 330,
      accel: 190,
      price: 4000,
    },
    muscle: {
      name: "Rumbler GT",
      length: 53,
      width: 27,
      max: 360,
      accel: 190,
      price: 4600,
    },
    limo: {
      name: "Crown Eight",
      length: 78,
      width: 27,
      max: 250,
      accel: 100,
      price: 7200,
    },
    bus: {
      name: "Sunliner",
      length: 94,
      width: 32,
      max: 185,
      accel: 75,
      price: 5200,
    },
    motorcycle: {
      name: "Wasp 900",
      length: 30,
      width: 13,
      max: 380,
      accel: 240,
      price: 2100,
    },
    boat: {
      name: "Marlin Sprint",
      length: 71,
      width: 28,
      max: 360,
      accel: 140,
      price: 5000,
      water: true,
    },
    jetski: {
      name: "Foamrunner",
      length: 35,
      width: 17,
      max: 330,
      accel: 230,
      price: 2200,
      water: true,
    },
    helicopter: {
      name: "Kestrel Civil",
      length: 68,
      width: 29,
      max: 410,
      accel: 150,
      price: 18000,
      air: true,
    },
    armored: {
      name: "Bastion",
      length: 64,
      width: 32,
      max: 240,
      accel: 120,
      price: 9000,
    },
  };
  function makeVehicle(type, x, y, angle = 0, color = "#ed714c", ai = false) {
    return {
      type,
      x,
      y,
      angle,
      color,
      ai,
      speed: 0,
      hp: type === "armored" ? 260 : 100,
      damageTimer: 0,
      stolen: false,
      turnTimer: 0,
      ...vehicleTypes[type],
    };
  }
  function enterExit(g) {
    const p = g.player;
    if (p.vehicle) {
      const v = p.vehicle;
      const choices = [Math.PI / 2, -Math.PI / 2, Math.PI];
      for (const side of choices) {
        const x = v.x + Math.cos(v.angle + side) * (v.water ? 88 : 43);
        const y = v.y + Math.sin(v.angle + side) * (v.water ? 88 : 43);
        if (!isSolid(x, y, 5) || v.air) {
          p.x = x;
          p.y = y;
          if (isWater(x, y)) {
            p.x = 1960;
            p.y = v.y;
          }
          p.vehicle = null;
          v.speed = 0;
          v.vx = 0;
          v.vy = 0;
          g.message = "Back on foot";
          return;
        }
      }
      g.message = "Find clear ground to exit";
      return;
    }
    const near = g.vehicles
      .filter((v) => v.hp > 0 && distance(v, p) < (v.water ? 140 : 85))
      .sort((a, b) => distance(a, p) - distance(b, p))[0];
    if (!near) return;
    if (near.ai && !near.police) {
      g.pedestrians.push({
        x: near.x,
        y: near.y + 35,
        angle: 1.5,
        fear: 12,
        color: "#fdba88",
        hp: 60,
      });
    }
    near.ai = false;
    p.vehicle = near;
    if (!near.stolen) {
      near.stolen = true;
      g.crime(near.police ? 2 : 1);
    }
    g.message = near.name + " • R switches radio";
    g.audio.effect("pickup");
  }
  function updatePlayer(g, dt) {
    const p = g.player;
    const input = g.input;
    const forward =
      Number(input.down("KeyW", "ArrowUp")) -
      Number(input.down("KeyS", "ArrowDown"));
    const turn =
      Number(input.down("KeyD", "ArrowRight")) -
      Number(input.down("KeyA", "ArrowLeft"));
    if (p.vehicle) {
      const v = p.vehicle;
      const oldX = v.x;
      const oldY = v.y;
      const skid = input.down("Space");
      v.speed += forward * v.accel * dt;
      v.speed *= Math.pow(skid ? 0.35 : 0.81, dt);
      if (!forward) v.speed *= Math.pow(0.65, dt);
      v.speed = clamp(v.speed, -v.max * 0.35, v.max);
      const steer = v.air || v.water ? 1 : Math.min(1, Math.abs(v.speed) / 70);
      v.angle +=
        turn * steer * (skid ? 2.8 : 1.8) * dt * (v.speed < -3 ? -1 : 1);
      const desiredX = Math.cos(v.angle) * v.speed;
      const desiredY = Math.sin(v.angle) * v.speed;
      if (v.air || v.water) {
        v.x += desiredX * dt;
        v.y += desiredY * dt;
      } else {
        // A released rear axle keeps lateral momentum through handbrake turns.
        const grip = Math.min(1, dt * (skid ? 2.1 : 9));
        v.vx = (v.vx ?? desiredX) + (desiredX - (v.vx ?? desiredX)) * grip;
        v.vy = (v.vy ?? desiredY) + (desiredY - (v.vy ?? desiredY)) * grip;
        v.x += v.vx * dt;
        v.y += v.vy * dt;
      }
      const blocked = v.air
        ? v.x < 30 || v.x > 4770 || v.y < 30 || v.y > 3840
        : v.water
          ? !isWater(v.x, v.y)
          : isSolid(v.x, v.y, 15);
      if (blocked) {
        v.x = oldX;
        v.y = oldY;
        if (Math.abs(v.speed) > 90) {
          v.hp -= Math.abs(v.speed) * 0.045;
          burst(
            g,
            v.x + Math.cos(v.angle) * 24,
            v.y + Math.sin(v.angle) * 24,
            "#ffd778",
            14,
          );
          g.shake = 5;
          for (const ped of g.pedestrians) {
            if (distance(ped, v) < 240) ped.fear = 7;
          }
          g.audio.effect("crash");
        }
        v.speed *= -0.25;
        v.vx = (v.vx || 0) * -0.2;
        v.vy = (v.vy || 0) * -0.2;
      }
      if (skid && Math.abs(v.speed) > 80 && !v.water && !v.air) {
        g.skids.push({ x: v.x, y: v.y, angle: v.angle, life: 18 });
        if (g.skids.length > 450) g.skids.shift();
      }
      if (v.hp < 40 && random() < dt * 12) burst(g, v.x, v.y, "#5a605d", 1, 20);
      if (v.hp <= 0) {
        burst(g, v.x, v.y, "#ff9d3d", 65, 170);
        g.shake = 15;
        p.vehicle = null;
        p.health -= 50;
        p.x = v.x + 50;
        p.y = v.y;
        g.audio.effect("explosion");
      } else {
        p.x = v.x;
        p.y = v.y;
        p.angle = v.angle;
      }
      if (v.air && random() < dt * 18)
        burst(g, v.x, v.y + 36, "#dce4cd", 2, 80);
    } else {
      let dx = turn;
      let dy = -forward;
      const len = Math.hypot(dx, dy) || 1;
      const speed = input.down("ShiftLeft", "ShiftRight") ? 190 : 115;
      dx = (dx / len) * speed * dt;
      dy = (dy / len) * speed * dt;
      if (!isSolid(p.x + dx, p.y, 8)) p.x += dx;
      if (!isSolid(p.x, p.y + dy, 8)) p.y += dy;
      p.angle = Math.atan2(input.mouse.y - 360, input.mouse.x - 640);
    }
    p.x = clamp(p.x, 30, 4770);
    p.y = clamp(p.y, 30, 3840);
    for (const v of g.vehicles) {
      if (
        v === p.vehicle ||
        distance(v, p) > 43 ||
        !p.vehicle ||
        v.air ||
        p.vehicle.air
      )
        continue;
      const impact = Math.abs(p.vehicle.speed - v.speed);
      if (impact > 75 && v.damageTimer <= 0) {
        v.hp -= impact * 0.09;
        p.vehicle.hp -= impact * 0.04;
        p.vehicle.speed *= -0.2;
        v.speed *= 0.3;
        v.damageTimer = 1;
        burst(g, (p.x + v.x) / 2, (p.y + v.y) / 2, "#ffe7a4", 16);
        g.shake = 5;
        for (const ped of g.pedestrians) {
          if (distance(ped, p) < 240) ped.fear = 7;
        }
        g.crime(0.25);
        g.audio.effect("crash");
      }
    }
    for (const v of g.vehicles) {
      v.damageTimer = Math.max(0, v.damageTimer - dt);
      if (v.hp <= 0 && !v.exploded) {
        v.exploded = true;
        burst(g, v.x, v.y, "#ffab48", 48, 130);
        burst(g, v.x, v.y, "#626f68", 22, 90);
        if (distance(v, p) < 500) g.audio.effect("explosion");
        if (distance(v, p) < 90) g.hurt(18);
      } else if (
        v.hp < 35 &&
        v.hp > 0 &&
        distance(v, p) < 800 &&
        random() < dt * 5
      ) {
        burst(g, v.x, v.y, "#556966", 1, 15);
      }
    }
  }

  Object.assign(window.Solstice, {
    vehicleTypes,
    makeVehicle,
    enterExit,
    updatePlayer,
  });
})();
