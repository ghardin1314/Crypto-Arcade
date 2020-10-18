export default class ParticleClient {
  constructor(args) {
    this.position = args.position
    this.velocity = args.velocity
    this.radius = args.radius;
    this.lifeSpan = args.lifeSpan;
    this.inertia = args.inertia;
  }

  render(state){
    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.fillStyle = '#ffffff';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -this.radius);
    context.arc(0, 0, this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
