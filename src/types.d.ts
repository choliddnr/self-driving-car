export type Point = {
  x: number;
  y: number;
};

export type Reading = Point & {
  offset: number;
};

export type ActivationFunction = "relu" | "sigmoid" | "none";
