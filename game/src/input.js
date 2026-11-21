export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 640, y: 360, down: false, clicked: false };
    addEventListener('keydown', event => {
      if (!this.keys.has(event.code)) this.pressed.add(event.code);
      this.keys.add(event.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.code)) event.preventDefault();
    });
    addEventListener('keyup', event => this.keys.delete(event.code));
    canvas.addEventListener('mousemove', event => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (event.clientX - rect.left) * 1280 / rect.width;
      this.mouse.y = (event.clientY - rect.top) * 720 / rect.height;
    });
    canvas.addEventListener('mousedown', () => {
      this.mouse.down = true;
      this.mouse.clicked = true;
    });
    addEventListener('mouseup', () => this.mouse.down = false);
    addEventListener('blur', () => this.keys.clear());
  }
  down(...keys) { return keys.some(key => this.keys.has(key)); }
  tap(...keys) { return keys.some(key => this.pressed.has(key)); }
  endFrame() {
    this.pressed.clear();
    this.mouse.clicked = false;
  }
}
