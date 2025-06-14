class Neuron {
  constructor(activation) {
    this.output = Math.random();
    this.activation = activation;
    this.x = 0;
  }
  feedForward(inputs, weights, biases) {
    let ff = 0;
    for (let i = 0; i < inputs.length; i++) {
      ff += inputs[i] * weights[i];
    }
    this.x = ff + biases;
    switch (this.activation) {
      case "relu":
        this.output = this.relu(this.x);
        break;
      case "sigmoid":
        this.output = this.sigmoid(this.x);
        break;

      default:
        this.output = this.x;
        break;
    }
    return this.output;
  }
  relu(x) {
    // return Math.max(0.0, x);
    return x;
  }
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
}

class Layer {
  constructor(structure, inputLayer = null) {
    this.activation = structure[1];
    this.neuronCount = structure[0];
    this.inputLayer = inputLayer;
    if (this.inputLayer != null) {
      this.inputs = new Array(this.inputLayer);
      this.biases = Math.random() * 2 - 1;
      this.weights = [];
      for (let i = 0; i < this.neuronCount; i++) {
        this.weights[i] = new Array(this.neuronCount);
      }

      for (let n = 0; n < this.neuronCount; n++) {
        for (let i = 0; i < this.inputLayer; i++) {
          this.weights[n][i] = Math.random() * 2 - 1;
        }
      }

      this.neurons = [];
      this.outputs = [];
      for (let i = 0; i < this.neuronCount; i++) {
        this.neurons.push(new Neuron(this.activation));
        this.outputs.push(this.neurons[i].output);
      }
    } else {
      this.inputs = new Array(this.neuronCount);
    }
  }

  feedForward(inputs) {
    this.inputs = inputs;
    for (let n = 0; n < this.neuronCount; n++) {
      this.outputs[n] = this.neurons[n].feedForward(
        this.inputs,
        this.weights[n],
        this.biases
      );
    }
    return this.outputs;
  }
}

class NN {
  constructor(structure) {
    this.nnInputs = [];
    let inputCount = null;
    this.layers = [];
    for (let i = 0; i < structure.length; i++) {
      this.layers[i] = new Layer(structure[i], inputCount);
      inputCount = this.layers[i].neuronCount;
    }
    this.outputs = [];
  }
  feedForward(inputs) {
    // console.log(this.layers[1]);
    this.nnInputs = inputs;
    let input_layer = this.nnInputs;
    for (let i = 1; i < this.layers.length; i++) {
      let outputs = [];
      console.log(i);
      outputs = this.layers[i].feedForward(input_layer);
      input_layer = [];
      input_layer = outputs;
    }
    this.outputs = input_layer;
    // return input_layer;
  }
}
