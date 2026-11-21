(() => {
  "use strict";

  function openDialogue(g, speaker, text, callback = null) {
    g.dialogue = { speaker, text, shown: 0, callback };
  }
  function updateDialogue(g, dt) {
    const d = g.dialogue;
    if (!d) return;
    d.shown = Math.min(d.text.length, d.shown + dt * 46);
    if (g.input.tap("Space", "Enter", "KeyE") || g.input.mouse.clicked) {
      if (d.shown < d.text.length) d.shown = d.text.length;
      else {
        g.dialogue = null;
        d.callback?.();
      }
    }
  }

  Object.assign(window.Solstice, { openDialogue, updateDialogue });
})();
