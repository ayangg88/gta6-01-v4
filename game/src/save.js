export function saveGame(g, slot = g.slot) {
  try {
    localStorage.setItem('solstice-heat-' + slot, JSON.stringify({ cash: g.cash, respect: g.respect, completed: g.completed, x: g.player.x, y: g.player.y, health: 100, armor: g.player.armor, ammo: g.player.ammo, owned: g.player.owned, storedCar: g.storedCar, packages: g.packages.map(p => p.collected), clock: g.clock }));
    g.message = 'Saved to slot ' + slot;
  } catch { g.message = 'Storage unavailable • game continues'; }
}
export function hasSave(slot) {
  try { return !!localStorage.getItem('solstice-heat-' + slot); } catch { return false; }
}
export function loadGame(g, slot) {
  try {
    const data = JSON.parse(localStorage.getItem('solstice-heat-' + slot));
    if (!data) return false;
    for (const key of ['cash', 'respect', 'completed', 'storedCar', 'clock']) g[key] = data[key];
    for (const key of ['x', 'y', 'health', 'armor', 'ammo', 'owned']) g.player[key] = data[key];
    g.player.vehicle = null;
    data.packages.forEach((collected, index) => g.packages[index].collected = collected);
    g.slot = slot;
    return true;
  } catch { return false; }
}
