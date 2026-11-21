(() => {
  "use strict";
  const { updateRadio } = window.Solstice;

  class AudioSystem {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.station = 0;
      this.beat = 0;
      this.musicTimer = 0;
      this.sirenTimer = 0;
    }
    start() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
        this.engine = this.ctx.createOscillator();
        this.engine.type = "sawtooth";
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0;
        this.engine.connect(this.engineGain).connect(this.master);
        this.engine.start();
      }
      this.ctx.resume();
    }
    tone(frequency, duration, volume, wave = "sine", end = frequency) {
      if (!this.ctx || this.muted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, end),
        this.ctx.currentTime + duration,
      );
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + duration,
      );
      osc.connect(gain).connect(this.master);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }
    effect(type) {
      if (type === "shot") this.tone(150, 0.13, 0.22, "sawtooth", 30);
      if (type === "crash") this.tone(95, 0.24, 0.24, "square", 17);
      if (type === "explosion") this.tone(130, 0.7, 0.4, "sawtooth", 9);
      if (type === "pickup") {
        this.tone(660, 0.12, 0.1, "sine");
        this.tone(990, 0.25, 0.08, "triangle");
      }
    }
    update(g, dt) {
      if (!this.ctx) return;
      this.master.gain.value = this.muted ? 0 : 0.5;
      const v = g.player.vehicle;
      this.engineGain.gain.setTargetAtTime(
        v && !g.paused ? 0.025 : 0,
        this.ctx.currentTime,
        0.1,
      );
      this.engine.frequency.setTargetAtTime(
        v
          ? v.air
            ? 35 + Math.sin(g.elapsed * 28) * 9
            : 40 + Math.abs(v.speed) * 0.45
          : 40,
        this.ctx.currentTime,
        0.12,
      );
      this.sirenTimer -= dt;
      if (g.heat > 0 && this.sirenTimer < 0) {
        this.sirenTimer = 0.6;
        this.tone(
          Math.floor(g.elapsed * 2) % 2 ? 580 : 790,
          0.5,
          0.025,
          "sine",
        );
      }
      updateRadio(this, dt, !!v && !g.paused);
    }
  }

  Object.assign(window.Solstice, { AudioSystem });
})();
