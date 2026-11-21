import { shops, isSolid } from './city.js';
import { distance, random, pick } from './random.js';
import { vehicleTypes, makeVehicle } from './vehicles.js';
import { weaponData } from './weapons.js';
export function createCollectibles(g) {
  for (let i = 0; i < 20; i++) {
    g.packages.push({ x: 180 + i % 5 * 380, y: 350 + Math.floor(i / 5) * 825, collected: false });
  }
  g.jumps = [{ x: 1720, y: 1520 }, { x: 1280, y: 3220 }, { x: 3370, y: 1810 }];
  g.pickups.push({ x: 750, y: 1150, type: 'ammo' }, { x: 950, y: 1420, type: 'health' }, { x: 1850, y: 2020, type: 'armor' });
}
export function interactEconomy(g) {
  const near = shops.find(s => distance(s, g.player) < 125);
  if (!near) return false;
  if (near.type === 'paint') {
    if (!g.player.vehicle || g.player.vehicle.water || g.player.vehicle.air) { g.message = 'Bring a car to Chroma Customs'; return true; }
    if (g.cash < 250) { g.message = 'Respray costs $250'; return true; }
    g.cash -= 250;
    g.player.vehicle.color = pick(['#f6c95e', '#70bcb3', '#de789a', '#85a5d7', '#f18252']);
    g.player.vehicle.hp = 100;
    g.heat = 0;
    g.officers = [];
    g.vehicles = g.vehicles.filter(v => !v.police);
    g.message = 'Fresh paint, clean plate • heat cleared';
    g.save();
  } else if (near.type === 'store') {
    if (g.storeCooldown > 0) { g.message = 'The till is empty. Come back later.'; return true; }
    g.cash += 380;
    g.storeCooldown = 90;
    g.crime(2);
    g.message = 'Till emptied • +$380 • police alerted';
    g.audio.effect('pickup');
  } else if (near.type === 'courier') {
    g.sideJob = { type: 'courier', x: 1740, y: 530, step: 0, text: 'Deliver the parcel to Palma • $450' };
    g.message = 'Courier package collected';
  } else if (near.type === 'taxi') {
    if (g.player.vehicle?.type !== 'taxi') { g.message = 'Bring a yellow taxi to start a shift'; return true; }
    g.sideJob = { type: 'taxi', x: 780, y: 1920, step: 0, text: 'Taxi fare • collect passenger in Old Town' };
  } else {
    g.shop = near.type;
    g.shopSelection = 0;
  }
  return true;
}
export function buyItem(g, index) {
  if (g.shop === 'arms') {
    const prices = [180, 900, 1900, 450];
    if (index === 2 && g.respect < 200) { g.message = 'SMG unlocks at 200 respect'; return; }
    if (g.cash < prices[index]) { g.message = 'Not enough cash'; return; }
    g.cash -= prices[index];
    if (index === 3) g.player.armor = 100;
    else { g.player.owned[index] = true; g.player.ammo[index] += index === 1 ? 28 : 100; g.player.weapon = index; }
    g.message = 'Purchase complete';
  } else if (g.shop === 'garage') {
    if (index === 0) {
      if (g.player.vehicle) { g.storedCar = { type: g.player.vehicle.type, color: g.player.vehicle.color }; g.message = 'Vehicle stored in your personal slot'; }
      else if (g.storedCar) {
        const v = makeVehicle(g.storedCar.type, 420, 2020, 0, g.storedCar.color);
        v.stolen = true;
        g.vehicles.push(v);
        g.player.vehicle = v;
        g.message = 'Personal vehicle retrieved';
      }
      else g.message = 'Drive a vehicle here to store it';
    } else {
      const type = ['sports', 'muscle', 'motorcycle'][index - 1];
      const cost = vehicleTypes[type].price;
      if (g.cash < cost) { g.message = 'Not enough cash'; return; }
      g.cash -= cost;
      const v = makeVehicle(type, 420, 2020, 0, '#e98556');
      v.stolen = true;
      g.vehicles.push(v);
      g.player.vehicle = v;
      g.message = 'The keys are yours';
    }
  }
  g.audio.effect('pickup');
  g.save();
}
export function updateEconomy(g, dt) {
  g.storeCooldown = Math.max(0, g.storeCooldown - dt);
  for (const p of g.packages) {
    if (!p.collected && distance(g.player, p) < 35) {
      p.collected = true;
      g.cash += 200;
      g.respect += 20;
      g.message = 'Hidden package • ' + g.packages.filter(p => p.collected).length + '/20 • +$200';
      g.audio.effect('pickup');
      g.save();
    }
  }
  g.pickups = g.pickups.filter(p => {
    if (distance(g.player, p) > 32) return true;
    if (p.type === 'ammo') for (let i = 0; i < 3; i++) g.player.ammo[i] += 18;
    if (p.type === 'health') g.player.health = Math.min(100, g.player.health + 40);
    if (p.type === 'armor') g.player.armor = Math.min(100, g.player.armor + 50);
    g.audio.effect('pickup');
    g.message = p.type.toUpperCase() + ' collected';
    return false;
  });
  const job = g.sideJob;
  if (job && distance(g.player, job) < 85) {
    if (job.type === 'taxi' && g.player.vehicle?.type !== 'taxi') return;
    if (job.type === 'taxi' && job.step === 0) {
      job.step = 1;
      job.x = 1280;
      job.y = 530;
      job.text = 'Passenger aboard • drive to Crown Mile • $300';
    } else {
      g.cash += job.type === 'taxi' ? 300 : 450;
      g.respect += 25;
      g.message = 'Job complete • cash deposited';
      g.sideJob = null;
      g.audio.effect('pickup');
      g.save();
    }
  }
  for (const jump of g.jumps) {
    if (g.player.vehicle && Math.abs(g.player.vehicle.speed) > 250 && distance(jump, g.player) < 35 && !jump.used) {
      jump.used = true;
      g.cash += 350;
      g.respect += 30;
      g.jumpTime = 1;
      g.message = 'STUNT JUMP • +$350 / +30 respect';
      g.audio.effect('pickup');
    }
  }
  g.jumpTime = Math.max(0, g.jumpTime - dt);
}
