import { writeFileSync } from 'node:fs';
const pages = await (await fetch('http://127.0.0.1:9222/json')).json();
const ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let sequence = 0;
const pending = new Map();
const errors = [];
const remoteRequests = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const callback = pending.get(message.id);
    pending.delete(message.id);
    message.error ? callback.reject(message.error) : callback.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (message.method === 'Network.loadingFailed') errors.push(message.params);
  if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url)) remoteRequests.push(message.params.request.url);
};
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    pending.set(++sequence, { resolve, reject });
    ws.send(JSON.stringify({ id: sequence, method, params }));
  });
}
await call('Page.enable');
await call('Runtime.enable');
await call('Network.enable');
await call('Page.navigate', { url: 'file://' + process.cwd() + '/game/index.html' });
await new Promise(resolve => setTimeout(resolve, 800));
const result = await call('Runtime.evaluate', {
  returnByValue: true,
  expression: `(() => {
    const g = window.game;
    const s = window.Solstice;
    const checks = {};
    g.shot = 'verification';
    g.started = true;
    checks.offlineLoads = !!g && !!s.render;
    checks.groundTypes = Object.values(s.vehicleTypes).filter(v => !v.water && !v.air).length;
    checks.allTargetsReachable = s.missionList.flatMap(m => m.steps).filter(t => !['boat', 'helicopter'].includes(t.mode)).filter(t => s.isSolid(t.x, t.y, 7)).map(t => t.text);
    checks.allPackagesReachable = g.packages.every(p => !s.isSolid(p.x, p.y, 8));
    g.cash = 50000;
    g.heat = 4;
    g.player.x = 1380;
    g.player.y = 2110;
    const car = s.makeVehicle('sports', 1380, 2110, 0, '#123456');
    g.vehicles.push(car);
    g.player.vehicle = car;
    s.interactEconomy(g);
    checks.paintShop = g.heat === 0 && car.color !== '#123456' && g.cash === 49750;
    g.player.vehicle = null;
    g.player.x = 880;
    g.player.y = 2610;
    const beforeRobbery = g.cash;
    s.interactEconomy(g);
    checks.storeRobbery = g.cash === beforeRobbery + 380 && g.heat >= 2;
    g.player.x = 1380;
    g.player.y = 3110;
    s.interactEconomy(g);
    g.player.x = g.sideJob.x;
    g.player.y = g.sideJob.y;
    const beforeCourier = g.cash;
    s.updateEconomy(g, .016);
    checks.courierPayout = !g.sideJob && g.cash === beforeCourier + 450;
    const taxi = s.makeVehicle('taxi', 380, 1110, 0, '#eed177');
    g.player.vehicle = taxi;
    g.player.x = 380;
    g.player.y = 1110;
    s.interactEconomy(g);
    g.player.x = g.sideJob.x;
    g.player.y = g.sideJob.y;
    s.updateEconomy(g, .016);
    checks.taxiPickup = g.sideJob.step === 1;
    g.player.x = g.sideJob.x;
    g.player.y = g.sideJob.y;
    const beforeFare = g.cash;
    s.updateEconomy(g, .016);
    checks.taxiDropoff = !g.sideJob && g.cash === beforeFare + 300;
    g.shop = 'garage';
    s.buyItem(g, 0);
    g.player.vehicle = null;
    s.buyItem(g, 0);
    checks.garageStorage = g.player.vehicle.type === 'taxi';
    const beforePurchase = g.cash;
    s.buyItem(g, 1);
    checks.garagePurchase = g.player.vehicle.type === 'sports' && g.cash === beforePurchase - 6500;
    g.shop = 'arms';
    g.respect = 1000;
    s.buyItem(g, 2);
    s.buyItem(g, 3);
    checks.smgAndArmor = g.player.owned[2] && g.player.armor === 100;
    g.shop = null;
    g.player.vehicle = null;
    g.player.weapon = 0;
    g.player.x = 780;
    g.player.y = 1020;
    g.player.angle = 0;
    g.vehicles = [];
    g.officers = [];
    g.pedestrians = [];
    g.enemies = [{x: 880, y: 1020, hp: 100, cooldown: 9}];
    g.input.mouse.down = true;
    g.fireTimer = 0;
    s.updateWeapons(g, .016);
    g.input.mouse.down = false;
    for (let frame = 0; frame < 20; frame++) s.updateWeapons(g, .016);
    checks.bulletDamage = g.enemies[0].hp < 100;
    g.heat = 5;
    g.policeSpawn = 0;
    s.updatePolice(g, .016);
    checks.fiveStarResponse = !!g.policeHeli && !!g.roadblock && g.vehicles.some(v => v.type === 'armored');
    g.vehicles = [];
    g.officers = [];
    g.policeHeli = null;
    g.heat = 2;
    g.hideTime = 7;
    g.policeSpawn = 999;
    s.updatePolice(g, 2);
    checks.wantedDecays = g.heat < 2;
    g.arrest = 4;
    s.updatePolice(g, .016);
    checks.busted = g.gameOver === 'BUSTED';
    g.gameOver = null;
    g.hurt(1000);
    checks.wasted = g.gameOver === 'WASTED';
    g.gameOver = null;
    g.arrest = 0;
    g.player.health = 100;
    const boat = s.makeVehicle('boat', 2300, 2600, -.5, '#eaa566');
    g.player.x = boat.x;
    g.player.y = boat.y;
    g.player.vehicle = boat;
    s.saveGame(g, 3);
    g.player.vehicle = null;
    s.loadGame(g, 3);
    checks.boatSaveRestoresVehicle = g.player.vehicle?.water && g.player.x === 2300;
    checks.missionChains = [];
    for (let index = 0; index < s.missionList.length; index++) {
      g.completed = index;
      g.respect = 2000;
      g.completeScreen = null;
      s.beginMission(g, index);
      g.dialogue = null;
      let attempts = 0;
      while (g.mission && attempts++ < 30) {
        const target = s.missionTarget(g);
        g.player.x = target.x;
        g.player.y = target.y;
        const type = target.mode === 'boat' ? 'boat' : target.mode === 'helicopter' ? 'helicopter' : target.mode === 'taxi' ? 'taxi' : 'sports';
        g.player.vehicle = ['car', 'boat', 'helicopter', 'taxi', 'race'].includes(target.mode) ? s.makeVehicle(type, target.x, target.y) : null;
        g.input.keys.add('KeyE');
        s.updateMissions(g, target.mode === 'interact' ? 3.2 : .016);
        if (target.mode === 'fight') {
          g.enemies.forEach(enemy => enemy.hp = 0);
          s.updateMissions(g, .016);
        }
        g.input.keys.delete('KeyE');
      }
      checks.missionChains.push({ name: s.missionList[index].name, completed: !g.mission && g.completed === index + 1 });
    }
    return checks;
  })()`
});
console.log(JSON.stringify({ checks: result.result?.value, exception: result.exceptionDetails, errors, remoteRequests }, null, 2));
ws.close();

const checks = result.result?.value;
if (!checks || result.exceptionDetails || errors.length || remoteRequests.length || Object.values(checks).some(value => value === false) || checks.allTargetsReachable.length || checks.missionChains.some(mission => !mission.completed)) process.exitCode = 1;
