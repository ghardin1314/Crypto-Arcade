
export default class Asteroid {
  constructor(args) {
    this.position = args.position;
    this.velocity = args.velocity;
    this.rotation = args.rotation;
    this.rotationSpeed = args.rotationSpeed;
    this.radius = args.radius;
    this.score = (80 / this.radius) * 5;
    this.create = args.create;
    this.addScore = args.score;
    this.vertices = args.vertices;
  }

  render(state) {
    // Screen edges
    if (this.position.x > state.screen.width + this.radius)
      this.position.x = -this.radius;
    else if (this.position.x < -this.radius)
      this.position.x = state.screen.width + this.radius;
    if (this.position.y > state.screen.height + this.radius)
      this.position.y = -this.radius;
    else if (this.position.y < -this.radius)
      this.position.y = state.screen.height + this.radius;

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.strokeStyle = "#FFF";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -this.radius);
    for (let i = 1; i < this.vertices.length; i++) {
      context.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    context.closePath();
    context.stroke();
    context.restore();
  }
}
