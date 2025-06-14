import { Car } from "./car";
import type { Point, Reading } from "./types";
import { getIntersection, lerp } from "./utils";

class Sensor {
  car: Car;
  rayCount: number = 5;
  rayLength: number = 100;
  raySpread: number = Math.PI / 2;
  rays: [Point, Point][] = [];
  readings: (Reading | null)[] = [];

  constructor(car: Car) {
    this.car = car;
    this.rayCount = 5;
    this.rayLength = 100;
    this.raySpread = Math.PI / 2;

    this.rays = [];
  }
  #getReading(
    ray: [Point, Point],
    roadBorders: [Point, Point][],
    traffic: Car[]
  ): Reading | null {
    // console.log(roadBorders[0], traffic[0]);
    let touches = [];
    for (let i = 0; i < roadBorders.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );
      if (touch) {
        touches.push(touch);
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      for (let j = 0; j < traffic[i].polygon.length; j++) {
        const touch = getIntersection(
          ray[0],
          ray[1],
          traffic[i].polygon[j],
          traffic[i].polygon[(j + 1) % traffic[i].polygon.length]
        );
        if (touch) {
          touches.push(touch);
        }
      }
    }
    if (touches.length == 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset == minOffset) || null;
    }
  }
  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      let rayAngle =
        lerp(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) +
        this.car.angle;
      if (this.car.isDummy) {
        rayAngle = this.car.angle;
      }
      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  update(roadBorders: [Point, Point][], traffic: Car[]): void {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }
  draw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = { x: this.readings[i]?.x || 0, y: this.readings[i]?.y || 0 };
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }
}

export { Sensor };
