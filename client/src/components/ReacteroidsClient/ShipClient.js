// import Bullet from './Bullet';
// import Particle from './Particle';
// import { rotatePoint, randomNumBetween } from './helpers';

export default class ShipClient {
  constructor(args) {
    this.position = args.position
    this.velocity = args.velocity
    this.rotation = args.rotation
    this.rotationSpeed = args.rotationSpeed
    this.speed = args.speed
    this.inertia = args.inertia
    this.radius = args.radius
    this.lastShot = args.lastShot
  }

  render(state){
    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = '#ffffff';
    context.fillStyle = '#000000';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -15);
    context.lineTo(10, 10);
    context.lineTo(5, 7);
    context.lineTo(-5, 7);
    context.lineTo(-10, 10);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }
}
