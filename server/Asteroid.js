let Particle = require("./Particle");
let { asteroidVertices, randomNumBetween } = require("./helpers");
const { FRAME_RATE } = require("./constants");

class Asteroid {
  constructor(args) {
    this.position = args.position;
    this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5),
    };
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1);
    this.radius = args.size;
    this.score = (80 / this.radius) * 5;
    this.create = args.create;
    this.addScore = args.addScore;
    this.vertices = asteroidVertices(8, args.size);
  }

  destroy(state) {
    this.delete = true;
    this.addScore(this.score, state);

    // Explode
    for (let i = 0; i < this.radius; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 3),
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
      this.create(particle, "particles", state);
    }

    // Break into smaller asteroids
    if (this.radius > 10) {
      for (let i = 0; i < 2; i++) {
        let asteroid = new Asteroid({
          size: this.radius / 2,
          position: {
            x: randomNumBetween(-10, 20) + this.position.x,
            y: randomNumBetween(-10, 20) + this.position.y,
          },
          create: this.create.bind(this),
          addScore: this.addScore.bind(this),
        });
        this.create(asteroid, "asteroids", state);
      }
    }
  }

  render(state) {
    // Move
    this.position.x += this.velocity.x * 60/FRAME_RATE;
    this.position.y += this.velocity.y * 60/FRAME_RATE;

    // Rotation
    this.rotation += this.rotationSpeed * 60/FRAME_RATE;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if (this.position.x > state.screen.width + this.radius)
      this.position.x = -this.radius;
    else if (this.position.x < -this.radius)
      this.position.x = state.screen.width + this.radius;
    if (this.position.y > state.screen.height + this.radius)
      this.position.y = -this.radius;
    else if (this.position.y < -this.radius)
      this.position.y = state.screen.height + this.radius;
}}

module.exports = Asteroid
