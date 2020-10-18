let Bullet = require("./Bullet");
let Particle = require("./Particle");
let { rotatePoint, randomNumBetween } = require("./helpers");
const { FRAME_RATE } = require("./constants");

class Ship {
  constructor(args) {
    this.position = args.position;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 1;
    this.lastShot = 0;
    this.create = args.create;
    this.onDie = args.onDie;
  }

  destroy(state) {
    this.delete = true;
    this.onDie();

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x:
            this.position.x +
            randomNumBetween(-this.radius / 4, this.radius / 4),
          y:
            this.position.y +
            randomNumBetween(-this.radius / 4, this.radius / 4),
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5),
        },
      });
      this.create(particle, 'particles', state);
    }
  }

  rotate(dir) {
    if (dir === "LEFT") {
      this.rotation -= (this.rotationSpeed * 60) / FRAME_RATE;
    }
    if (dir === "RIGHT") {
      this.rotation += (this.rotationSpeed * 60) / FRAME_RATE;
    }
  }

  accelerate(val, state) {
    this.velocity.x -= Math.sin((-this.rotation * Math.PI) / 180) * this.speed;
    this.velocity.y -= Math.cos((-this.rotation * Math.PI) / 180) * this.speed;

    // Thruster particles
    let posDelta = rotatePoint(
      { x: 0, y: -10 },
      { x: 0, y: 0 },
      ((this.rotation - 180) * Math.PI) / 180
    );
    const particle = new Particle({
      lifeSpan: randomNumBetween(20, 40),
      size: randomNumBetween(1, 3),
      position: {
        x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        y: this.position.y + posDelta.y + randomNumBetween(-2, 2),
      },
      velocity: {
        x: posDelta.x / randomNumBetween(3, 5),
        y: posDelta.y / randomNumBetween(3, 5),
      },
    });
    this.create(particle, "particles", state);
  }

  render(state) {
    // Controls
    if (state.keys.up) {
      this.accelerate(1, state);
    }
    if (state.keys.left) {
      this.rotate("LEFT");
    }
    if (state.keys.right) {
      this.rotate("RIGHT");
    }
    if (state.keys.space && Date.now() - this.lastShot > 300) {
      const bullet = new Bullet({ ship: this });
      this.create(bullet, "bullets", state);
      this.lastShot = Date.now();
    }

    // Move
    this.position.x += (this.velocity.x * 60) / FRAME_RATE;
    this.position.y += (this.velocity.y * 60) / FRAME_RATE;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Rotation
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if (this.position.x > state.screen.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = state.screen.width;
    if (this.position.y > state.screen.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = state.screen.height;
  }
}

module.exports = Ship;
