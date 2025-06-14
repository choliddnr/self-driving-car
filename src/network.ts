import type { ActivationFunction } from "./types";
import { lerp } from "./utils";

class Neuron {
  output: number;
  activation: ActivationFunction;

  constructor(activation: ActivationFunction) {
    this.activation = activation;
    this.output = 0;
  }

  feedForward(inputs: Neuron[], weights: number[], bias: number): void {
    let ff = 0;
    for (let i = 0; i < inputs.length; i++) {
      ff += inputs[i].output * weights[i];
    }
    ff += bias;
    switch (this.activation) {
      case "sigmoid":
        this.output = this.#sigmoid(ff);
        break;
      case "relu":
        this.output = this.#relu(ff);
        break;
      default:
        this.output = ff;
        break;
    }
  }

  #sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  #relu(x: number): number {
    return Math.max(0.0, x);
  }
}

class Layer {
  numNeuron: number;
  activation: ActivationFunction;
  neurons: Neuron[] = [];
  weights: number[][] = [];
  bias: number = 0;
  prevNeuron: Neuron[] = [];

  constructor(numNeuron: number, activation: ActivationFunction = "none") {
    this.numNeuron = numNeuron;
    this.activation = activation;
    this.#initNeuron();
  }

  input(prevNeuron: Neuron[]): void {
    this.prevNeuron = prevNeuron;
    this.#init();
  }

  #initNeuron(): void {
    this.neurons = [];
    for (let i = 0; i < this.numNeuron; i++) {
      this.neurons.push(new Neuron(this.activation));
    }
  }

  #init(): void {
    this.weights = new Array(this.numNeuron);
    for (let i = 0; i < this.numNeuron; i++) {
      this.weights[i] = new Array(this.prevNeuron.length);
      for (let j = 0; j < this.prevNeuron.length; j++) {
        this.weights[i][j] = Math.random() * 2 - 1;
      }
    }
    this.bias = Math.random() * 2 - 1;
  }

  feedForward(): void {
    for (let i = 0; i < this.neurons.length; i++) {
      this.neurons[i].feedForward(this.prevNeuron, this.weights[i], this.bias);
    }
  }
}

class Network {
  layers: Layer[] = [];
  outputs: number[] = [];

  constructor(struct: ([number] | [number, ActivationFunction])[]) {
    for (let i = 0; i < struct.length; i++) {
      this.layers.push(new Layer(struct[i][0], struct[i][1]));
    }
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].input(this.layers[i - 1].neurons);
    }
  }

  feedForward(inputs: number[]): void {
    this.outputs = [];
    for (let i = 0; i < this.layers[0].neurons.length; i++) {
      this.layers[0].neurons[i].output = inputs[i];
    }
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].feedForward();
    }
    this.outputs = this.layers.at(-1)?.neurons.map((n) => n.output) || [];
  }

  setWB(network: Network): void {
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].weights = network.layers[i].weights;
      this.layers[i].bias = network.layers[i].bias;
    }
  }

  mutate(amount: number = 1): void {
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].bias = lerp(
        this.layers[i].bias,
        Math.random() * 2 - 1,
        amount
      );
      for (let j = 0; j < this.layers[i].weights.length; j++) {
        for (let k = 0; k < this.layers[i].weights[j].length; k++) {
          this.layers[i].weights[j][k] = lerp(
            this.layers[i].weights[j][k],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    }
  }

  static test(nn: Network): Network {
    return nn;
  }
}

export { Network };
