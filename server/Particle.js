const { FRAME_RATE } = require("./constants");

class Particle {
  constructor(args) {
    this.position = args.position;
    this.velocity = args.velocity;
    this.radius = args.size;
    this.lifeSpan = args.lifeSpan;
    this.inertia = 0.98;
  }

  destroy() {
    this.delete = true;
  }

  render(state) {
    // Move
    this.position.x += (this.velocity.x * 60) / FRAME_RATE;
    this.position.y += (this.velocity.y * 60) / FRAME_RATE;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Shrink
    this.radius -= 0.1;
    if (this.radius < 0.1) {
      this.radius = 0.1;
    }
    this.lifeSpan -= (1 * 60) / FRAME_RATE;
    if (this.lifeSpan < 0) {
      this.destroy();
    }
  }
}

module.exports = Particle;
