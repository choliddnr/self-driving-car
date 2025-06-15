import type { Network } from "./network";
import { lerp } from "./utils";

class Visualizer {
  private nn: Network;
  private ctx: CanvasRenderingContext2D;
  private margin = 20;
  private top: number;
  private left: number;
  private width: number;
  private height: number;
  private bottom: number;
  private right: number;
  private nodes: Node[][] = [];
  private lines: Line[][][] = [];
  private layerSpace: number;
  private neuronSpace: number[] = [];
  private XY: [number, number][][] = [];

  constructor(nn: Network, ctx: CanvasRenderingContext2D) {
    this.nn = nn;
    this.ctx = ctx;
    this.top = this.margin;
    this.left = this.margin;
    this.width = this.ctx.canvas.width - this.margin * 2;
    this.height = this.ctx.canvas.height - this.margin * 2;
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;

    this.layerSpace =
      lerp(this.top, this.bottom, 1 / (this.nn.layers.length - 1)) - this.top;

    for (let i = 0; i < this.nn.layers.length; i++) {
      this.neuronSpace.push(
        lerp(this.left, this.right, 1 / this.nn.layers[i].numNeuron) - this.left
      );
    }

    this.#XY();
    this.#node();
    this.#line();
    this.#drawOutputSymbol();
  }

  #drawNeuron(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.nn.layers[i].numNeuron; j++) {
        if (i !== 0) {
          this.nodes[i][j].show(this.nn.layers[i].neurons[j].output);
        } else {
          this.nodes[i][j].show(this.nn.layers[i + 1].numNeuron);
        }
      }
      if (i !== 0) {
        this.nodes[i][this.nn.layers[i].numNeuron].show(
          this.nn.layers[i].bias,
          "B"
        );
      }
    }
  }

  #drawConnection(): void {
    for (let i = 0; i < this.lines.length; i++) {
      for (let j = 0; j < this.lines[i].length - 1; j++) {
        for (let k = 0; k < this.lines[i][j].length; k++) {
          this.lines[i][j][k].show(this.nn.layers[i + 1].weights[j][k]);
        }
      }
      for (let k = 0; k < this.lines[i][this.lines[i].length - 1].length; k++) {
        this.lines[i][this.lines[i].length - 1][k].show(
          this.nn.layers[i + 1].bias
        );
      }
    }
  }

  #XY(): void {
    let xy: [number, number] = [this.left, this.bottom];
    let layerXY: [number, number][] = [];

    for (let i = 0; i < this.nn.layers.length; i++) {
      for (let j = 0; j < this.nn.layers[i].numNeuron; j++) {
        layerXY.push([xy[0], xy[1]]);
        xy[0] += this.neuronSpace[i];
      }
      if (i !== 0) {
        layerXY.push([this.right, xy[1] + this.layerSpace / 2]);
      }
      xy[1] -= this.layerSpace;
      xy[0] = this.left;
      this.XY[i] = layerXY;
      layerXY = [];
    }
  }

  #node(): void {
    for (let i = 0; i < this.XY.length; i++) {
      const layerNode: Node[] = [];
      for (let j = 0; j < this.XY[i].length; j++) {
        layerNode.push(new Node(this.XY[i][j][0], this.XY[i][j][1], this.ctx));
      }
      this.nodes.push(layerNode);
    }
  }

  #line(): void {
    for (let i = 1; i < this.nn.layers.length; i++) {
      const layerLine: Line[][] = [];
      const biasesLine: Line[] = [];
      for (let j = 0; j < this.nn.layers[i].numNeuron; j++) {
        const eachLine: Line[] = [];
        for (let k = 0; k < this.nn.layers[i - 1].numNeuron; k++) {
          eachLine.push(new Line(this.XY[i][j], this.XY[i - 1][k], this.ctx));
        }
        layerLine.push(eachLine);
        biasesLine.push(
          new Line(this.XY[i][j], this.XY[i][this.XY[i].length - 1], this.ctx)
        );
      }
      layerLine.push(biasesLine);
      this.lines.push(layerLine);
    }
  }

  #drawOutputSymbol(): void {
    const symbol = ["🠉", "🠋", "🠈", "🠊"];
    const lastLayerXY = this.XY.slice(-1)[0];
    for (let i = 0; i < lastLayerXY.length - 1; i++) {
      this.ctx.beginPath();
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = "bold 20px Arial";
      this.ctx.fillText(symbol[i], lastLayerXY[i][0], lastLayerXY[i][1]);
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeText(symbol[i], lastLayerXY[i][0], lastLayerXY[i][1]);
    }
  }

  drawNN(nn: Network): void {
    this.nn = nn;
    this.#drawNeuron();
    this.#drawConnection();
    this.#drawOutputSymbol();
  }
}

class Node {
  private x: number;
  private y: number;
  private ctx: CanvasRenderingContext2D;
  private value: number = 0;

  constructor(x: number, y: number, ctx: CanvasRenderingContext2D) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
  }

  show(value: number, label: string = ""): void {
    this.value = value;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(254, 254, 9, ${this.value})`;
    this.ctx.fill();
  }
}

class Line {
  private node1: [number, number];
  private node2: [number, number];
  private ctx: CanvasRenderingContext2D;
  private value: number = 0;

  constructor(
    node1: [number, number],
    node2: [number, number],
    ctx: CanvasRenderingContext2D
  ) {
    this.node1 = node1;
    this.node2 = node2;
    this.ctx = ctx;
  }

  show(value: number): void {
    this.value = value;
    this.ctx.beginPath();
    this.ctx.moveTo(this.node1[0], this.node1[1]);
    this.ctx.lineTo(this.node2[0], this.node2[1]);
    this.ctx.strokeStyle = `rgba(254, 254, 9, ${this.value})`;
    this.ctx.stroke();
  }
}
export { Visualizer };
