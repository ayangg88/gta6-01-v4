(() => {
  "use strict";
  const { makeVehicle } = window.Solstice;

  function saveGame(g, slot = g.slot) {
    try {
      localStorage.setItem(
        "solstice-heat-" + slot,
        JSON.stringify({
          cash: g.cash,
          respect: g.respect,
          completed: g.completed,
          x: g.player.x,
          y: g.player.y,
          health: 100,
          armor: g.player.armor,
          ammo: g.player.ammo,
          owned: g.player.owned,
          storedCar: g.storedCar,
          vehicle: g.player.vehicle
            ? {
                type: g.player.vehicle.type,
                color: g.player.vehicle.color,
                angle: g.player.vehicle.angle,
                hp: g.player.vehicle.hp,
              }
            : null,
          packages: g.packages.map((p) => p.collected),
          clock: g.clock,
        }),
      );
      g.message = "Saved to slot " + slot;
    } catch {
      g.message = "Storage unavailable • game continues";
    }
  }
  function hasSave(slot) {
    try {
      return !!localStorage.getItem("solstice-heat-" + slot);
    } catch {
      return false;
    }
  }
  function loadGame(g, slot) {
    try {
      const data = JSON.parse(localStorage.getItem("solstice-heat-" + slot));
      if (!data) return false;
      for (const key of ["cash", "respect", "completed", "storedCar", "clock"])
        g[key] = data[key];
      for (const key of ["x", "y", "health", "armor", "ammo", "owned"])
        g.player[key] = data[key];
      if (g.player.vehicle)
        g.vehicles = g.vehicles.filter((v) => v !== g.player.vehicle);
      g.player.vehicle = null;
      if (data.vehicle) {
        const v = makeVehicle(
          data.vehicle.type,
          data.x,
          data.y,
          data.vehicle.angle,
          data.vehicle.color,
        );
        v.hp = Math.max(40, data.vehicle.hp);
        v.stolen = true;
        g.vehicles.push(v);
        g.player.vehicle = v;
      }
      g.mission = null;
      g.dialogue = null;
      g.heat = 0;
      g.officers = [];
      g.policeHeli = null;
      g.camera.x = g.player.x;
      g.camera.y = g.player.y;
      data.packages.forEach(
        (collected, index) => (g.packages[index].collected = collected),
      );
      g.slot = slot;
      return true;
    } catch {
      return false;
    }
  }

  Object.assign(window.Solstice, { saveGame, hasSave, loadGame });
})();
