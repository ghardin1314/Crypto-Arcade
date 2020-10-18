// import { rotatePoint } from "./helpers";

export default class BulletClient {
  constructor(args) {
    this.position = args.position;
    this.rotation = args.rotation;
    this.velocity = args.velocity;
    this.radius = args.radius;
  }

  render(state) {

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.fillStyle = "#FFF";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(0, 0, 2, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
