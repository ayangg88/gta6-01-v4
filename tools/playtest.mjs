import { writeFileSync } from 'node:fs';
const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let id = 0;
const pending = new Map();
const errors = [];
const failedRequests = [];
ws.onmessage = event => {
  const m = JSON.parse(event.data);
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
  if (m.method === 'Network.loadingFailed') failedRequests.push(m.params);
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) failedRequests.push(m.params.response.url);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function key(code, duration = 80) {
  const key = { Enter: 'Enter', Space: ' ', KeyE: 'e', KeyW: 'w', KeyP: 'p', Escape: 'Escape' }[code] || code;
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
  await delay(duration);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
  await delay(100);
}
const results = {};
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8083/' });
await delay(600);
await evaluate('localStorage.clear()');
await key('Enter');
results.started = await evaluate('game.started');
await key('KeyE');
results.missionTriggered = await evaluate('game.mission?.index === 0 && !!game.dialogue');
await key('Space');
await key('Space');
await key('KeyE');
results.enteredVehicle = await evaluate('game.player.vehicle?.type');
const before = await evaluate('({x:game.player.x,y:game.player.y})');
await key('KeyW', 1300);
const after = await evaluate('({x:game.player.x,y:game.player.y})');
results.drivenDistance = Math.hypot(after.x - before.x, after.y - before.y);
results.firstObjectiveAdvanced = await evaluate('game.mission?.step >= 1');
await key('KeyE');
results.exitedVehicle = await evaluate('game.player.vehicle === null');
const ammo = await evaluate('game.player.ammo[0]');
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 740, y: 300, button: 'left', clickCount: 1 });
await delay(350);
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 740, y: 300, button: 'left', clickCount: 1 });
results.shootingUsesAmmo = await evaluate('game.player.ammo[0]') < ammo;
await evaluate('game.player.x=680; game.player.y=1430; game.heat=0; game.mission=null; game.officers=[];');
await key('KeyE');
results.armsShopOpens = await evaluate('game.shop === "arms"');
const cash = await evaluate('game.cash');
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 600, y: 335, button: 'left', clickCount: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 600, y: 335, button: 'left', clickCount: 1 });
await delay(200);
results.shopPurchase = await evaluate('game.player.owned[1] && game.player.ammo[1] === 28 && game.cash === ' + (cash - 900));
await key('Escape');
await evaluate('game.completed=1; game.player.x=1480; game.player.y=858; solstice.beginMission(1);');
await key('Space');
await key('Space');
await delay(200);
results.vaultReachable = await evaluate('(async()=>{ const city=window.Solstice; return !city.isSolid(1480,858,8); })()');
await key('KeyE', 3300);
results.vaultOpened = await evaluate('game.mission?.step === 2 && game.heat >= 3');
await evaluate('game.player.x=580;game.player.y=1920;');
await delay(250);
results.missionComplete = await evaluate('game.completed === 2 && !!game.completeScreen');
await evaluate('game.completeScreen=null; game.mission=null; game.heat=0; game.vehicles=game.vehicles.filter(v=>!v.police); game.player.x=1975;game.player.y=2630;');
await key('KeyE');
results.enteredBoat = await evaluate('game.player.vehicle?.type');
await key('KeyW', 800);
results.boatMoves = await evaluate('game.player.vehicle?.speed > 40');
await evaluate('game.player.vehicle=null;game.player.x=3510;game.player.y=1150;');
await key('KeyE');
results.enteredHelicopter = await evaluate('game.player.vehicle?.type');
await key('KeyW', 800);
results.helicopterFlies = await evaluate('game.player.vehicle?.speed > 40');
await evaluate('solstice.save();');
results.saved = await evaluate('!!localStorage.getItem("solstice-heat-1")');
results.packageReachability = await evaluate('(async()=>{const {isSolid}=window.Solstice;return game.packages.every(p=>!isSolid(p.x,p.y,8));})()');
results.errors = errors;
results.failedRequests = failedRequests;
writeFileSync('playtest-results.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
ws.close();

if (Object.values(results).some(value => value === false) || results.drivenDistance < 20 || results.errors.length || results.failedRequests.length) process.exitCode = 1;
