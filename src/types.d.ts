export type Point = {
  x: number;
  y: number;
};

export type Reading = Point & {
  offset: number;
};

export type ActivationFunction = "relu" | "sigmoid" | "none";

export type NeuronLayer = {
  neuronCount: number;
  outputs: number[];
  inputs: number[];
  weights: number[][];
  bias: number;
  biases: number;
};

export type NeuralNetwork = {
  layers: NeuronLayer[];
};
