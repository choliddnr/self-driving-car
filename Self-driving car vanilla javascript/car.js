class Car {
  constructor(x, y, width, height, isDummy = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isDummy = isDummy;

    this.acceleration = 0.2;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false;

    if (this.isDummy) {
      this.speed = 1;
      this.maxSpeed = getRandomArbitrary(2.0, 2.0);
    } else {
      this.structure = [[5], [5], [4, "sigmoid"]];
      this.brain = new Network(this.structure);
      // sensor = [1, 0.2, 0.3, 0.7, 1];
      this.speed = 0;
      this.maxSpeed = 3.0;
      this.sensor = new Sensor(this);
      this.brain_threshold = 0.7;
    }

    this.controls = new Controls(this.isDummy);
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assesDamaged(roadBorders, traffic);
    }
    if (!this.isDummy) {
      this.sensor.update(roadBorders, traffic);
      let brain_inputs = [];
      for (let i = 0; i < this.sensor.readings.length; i++) {
        if (this.sensor.readings[i] == null) {
          brain_inputs.push(0);
        } else {
          brain_inputs.push(1.0 - this.sensor.readings[i].offset);
        }
      }
      this.brain.feedForward(brain_inputs);
      // console.log(brain_inputs);

      if (this.brain.outputs[0] >= this.brain_threshold) {
        this.controls.forward = true;
      } else {
        this.controls.forward = false;
      }
      if (this.brain.outputs[1] >= this.brain_threshold) {
        this.controls.reverse = true;
      } else {
        this.controls.reverse = false;
      }
      if (this.brain.outputs[2] >= this.brain_threshold) {
        this.controls.left = true;
      } else {
        this.controls.left = false;
      }
      if (this.brain.outputs[3] >= this.brain_threshold) {
        this.controls.right = true;
      } else {
        this.controls.right = false;
      }
      let y = [
        this.controls.forward,
        this.controls.reverse,
        this.controls.right,
        this.controls.left,
      ];
      // console.log(y);
    }
  }

  #assesDamaged(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const radius = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius,
      y: this.y - Math.cos(this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius,
      y: this.y - Math.cos(this.angle + alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
    });
    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }
    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;

      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx, drawSensor = false) {
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 0; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }

    if (this.isDummy) {
      ctx.fillStyle = "blue";
    } else {
      ctx.fillStyle = "red";
    }
    if (this.damaged) {
      ctx.fillStyle = "gray";
    }
    ctx.fill();

    if (!this.isDummy) {
      if (drawSensor) {
        this.sensor.draw(ctx);
      }
    }
  }
}
