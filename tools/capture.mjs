import { writeFileSync } from 'node:fs';
const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const target = targets.find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const callback = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) callback.reject(message.error);
    else callback.resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown' || message.method === 'Network.loadingFailed') errors.push(message);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
for (const [name, shot] of [['1-cover', 'chase'], ['2-street', 'street'], ['3-mission', 'mission'], ['4-drive', 'marina']]) {
  await send('Page.navigate', { url: 'http://127.0.0.1:8083/?shot=' + shot });
  await delay(650);
  const ready = await send('Runtime.evaluate', { expression: 'window.game?.shot === ' + JSON.stringify(shot), returnByValue: true });
  if (!ready.result?.value || errors.length) throw new Error('Scene failed to load: ' + shot + JSON.stringify(errors));
  const output = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync('screenshots/' + name + '.png', Buffer.from(output.data, 'base64'));
}
console.log(JSON.stringify({ errors }, null, 2));
ws.close();
