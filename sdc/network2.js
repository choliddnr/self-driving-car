class Neuron {
  constructor(activation) {
    this.activation = activation;
    this.output = 0;
  }
  feedForward(inputs, weights, bias) {
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
  #sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  #relu(x) {
    return Math.max(0.0, x);
  }
}

class Layer {
  constructor(numNeuron, activation) {
    this.numNeuron = numNeuron;
    this.activation = activation;
    this.#initNeuron();
  }
  input(prevNeuron) {
    this.prevNeuron = prevNeuron;
    this.#init();
  }
  #initNeuron() {
    this.neurons = [];
    for (let i = 0; i < this.numNeuron; i++) {
      this.neurons.push(new Neuron(this.activation));
    }
  }
  #init() {
    this.weights = new Array(this.numNeuron);
    for (let i = 0; i < this.numNeuron; i++) {
      this.weights[i] = new Array(this.prevNeuron.length);
      for (let j = 0; j < this.prevNeuron.length; j++) {
        this.weights[i][j] = Math.random() * 2 - 1;
      }
    }
    this.bias = Math.random() * 2 - 1;
  }
  feedForward() {
    for (let i = 0; i < this.neurons.length; i++) {
      this.neurons[i].feedForward(this.prevNeuron, this.weights[i], this.bias);
    }
  }
}

class Network {
  constructor(struct) {
    this.layers = [];
    for (let i = 0; i < struct.length; i++) {
      this.layers.push(new Layer(struct[i][0], struct[i][1]));
    }
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].input(this.layers[i - 1].neurons);
    }
  }
  feedForward(inputs) {
    this.outputs = [];
    for (let i = 0; i < this.layers[0].neurons.length; i++) {
      this.layers[0].neurons[i].output = inputs[i];
    }
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].feedForward();
    }
    this.layers.at(-1).neurons.forEach((n) => {
      this.outputs.push(n.output);
    });
  }

  setWB(network) {
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].weights = network.layers[i].weights;
      this.layers[i].bias = network.layers[i].bias;
    }
  }
  mutate(amount = 1) {
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

  static test(nn) {
    return nn;
  }
}

// const netStructure = [[5], [5, "relu"], [4, "sigmoid"]];
// const network = new Network(netStructure);
// network.feedForward([0, 0, 0.2, 0, 0.3]);
// console.log(network.outputs);
