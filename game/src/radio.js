(() => {
  "use strict";

  const stations = [
    {
      name: "COASTLINE 88.4",
      genre: "SUN-DRENCHED SYNTH",
      notes: [0, 7, 10, 14, 12, 7, 5, 10],
      wave: "triangle",
      tempo: 0.26,
    },
    {
      name: "AFTERIMAGE FM",
      genre: "MIDNIGHT ELECTRO",
      notes: [0, 0, 7, 3, 10, 7, 3, 5],
      wave: "sawtooth",
      tempo: 0.21,
    },
    {
      name: "PALM SOUL 103",
      genre: "SLOW COAST GROOVES",
      notes: [0, 4, 7, 11, 9, 7, 4, 2],
      wave: "sine",
      tempo: 0.34,
    },
  ];
  function updateRadio(audio, dt, enabled) {
    if (!audio.ctx || audio.muted || !enabled) return;
    audio.musicTimer -= dt;
    if (audio.musicTimer > 0) return;
    const station = stations[audio.station];
    audio.musicTimer = station.tempo;
    const note = station.notes[audio.beat % 8];
    audio.tone(164.81 * Math.pow(2, note / 12), 0.18, 0.032, station.wave);
    if (audio.beat % 2 === 0)
      audio.tone(
        65.4 * Math.pow(2, station.notes[Math.floor(audio.beat / 8) % 8] / 12),
        0.24,
        0.05,
        "sine",
      );
    if (audio.beat % 4 === 0) audio.tone(85, 0.07, 0.08, "triangle", 35);
    audio.beat++;
  }

  Object.assign(window.Solstice, { stations, updateRadio });
})();
