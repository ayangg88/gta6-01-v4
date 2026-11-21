(() => {
  "use strict";
  window.Solstice = {};

  function randomGenerator(seed = 73219) {
    return function random() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  const random = randomGenerator();
  const pick = (values) => values[Math.floor(random() * values.length)];
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function angleDifference(a, b) {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
  }

  Object.assign(window.Solstice, {
    randomGenerator,
    random,
    pick,
    clamp,
    distance,
    angleDifference,
  });
})();
