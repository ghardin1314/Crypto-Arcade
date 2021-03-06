let { rotatePoint } = require("./helpers");
const { FRAME_RATE } = require("./constants");

class Bullet {
  constructor(args) {
    let posDelta = rotatePoint(
      { x: 0, y: -20 },
      { x: 0, y: 0 },
      (args.ship.rotation * Math.PI) / 180
    );
    this.position = {
      x: args.ship.position.x + posDelta.x,
      y: args.ship.position.y + posDelta.y,
    };
    this.rotation = args.ship.rotation;
    this.velocity = {
      x: posDelta.x / 2,
      y: posDelta.y / 2,
    };
    this.radius = 2;
  }

  destroy() {
    this.delete = true;
  }

  render(state) {
    // Move
    this.position.x += (this.velocity.x * 60) / FRAME_RATE;
    this.position.y += (this.velocity.y * 60) / FRAME_RATE;

    // Delete if it goes out of bounds
    if (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x > state.screen.width ||
      this.position.y > state.screen.height
    ) {
      this.destroy();
    }
  }
}

module.exports = Bullet;
