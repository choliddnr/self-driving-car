import "./style.scss";
import { Road } from "./road";
import { Car } from "./car";
import { Visualizer } from "./visualizer";
import { Network } from "./network";

const envCanvas = document.getElementById("envCanvas") as HTMLCanvasElement;
const nnCanvas = document.getElementById("nnCanvas") as HTMLCanvasElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;
const discardBtn = document.getElementById("discard") as HTMLButtonElement;

envCanvas.height = window.innerHeight;
envCanvas.width = 180;
nnCanvas.height = window.innerHeight;
nnCanvas.width = 300;

const envCtx = envCanvas.getContext("2d");
const nnCtx = nnCanvas.getContext("2d");

const roadLaneCount = 3;

const road = new Road(
  envCanvas.width / 2,
  envCanvas.width * 0.9,
  roadLaneCount
);

// const car = new Car(road.getLaneCenter(1), 200, 30, 50);
let savedBrain: Network;

if (localStorage.getItem("bestBrain")) {
  // bestCar.brain.layers[2].bias = JSON.parse(
  //   localStorage.getItem("bestBrain")
  // );
  savedBrain = JSON.parse(localStorage.getItem("bestBrain")!) as Network;
} else {
  savedBrain = new Network([[7], [7], [4, "sigmoid"]]);
}
const N = 500;
const cars = generateCars(N, savedBrain);
let bestCar = cars[0];
if (savedBrain) {
  for (let i = 0; i < savedBrain.layers.length; i++) {
    bestCar.brain!.layers[i].bias = savedBrain.layers[i].bias;
    bestCar.brain!.layers[i].weights = savedBrain.layers[i].weights;
  }
  bestCar.brain!.outputs = savedBrain.outputs;
}
console.log("bestCar.brain", bestCar.brain, savedBrain);
// console.log(
//   "cars",
//   cars.length,
//   cars[0].brain?.outputs,
//   cars[1].brain?.outputs,
//   cars[2].brain?.outputs,
//   bestCar.brain?.outputs,
//   savedBrain?.outputs
// );

let visualizer: Visualizer = new Visualizer(bestCar.brain!, nnCtx!);

const traffic = [] as Car[];
// for (let i = 0; i < 2; i++) {
traffic.push(new Car(road.getLaneCenter(0), 100 - 700, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(1), 100 - 550, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(0), 100 - 500, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(0), 100 - 400, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(2), 100 - 400, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(1), 100 - 200, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(2), 100 - 200, 30, 50, true));
// }

animate();
function test() {
  if (localStorage.getItem("bestBrain")) {
    // bestCar.brain.layers[2].bias = JSON.parse(
    //   localStorage.getItem("bestBrain")
    // );
    const wb = JSON.parse(localStorage.getItem("bestBrain") || "");
    cars.forEach((car) => {
      // console.log(car.brain!.outputs);
      car.brain!.setWB(wb);
      // console.log(car.brain!.outputs);
      // car.brain.mutate();
    });
  }
}

saveBtn.addEventListener("click", () => save());
function save() {
  if (localStorage.getItem("bestBrain")) {
    discard();
  }
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  // const savedBrain = JSON.parse(localStorage.getItem("bestBrain"));
  let loop = 0;
  if (localStorage.getItem("loop")) {
    loop = JSON.parse(localStorage.getItem("loop")!);
  }
  loop++;
  localStorage.setItem("loop", JSON.stringify(loop));

  window.location.reload();
}

discardBtn.addEventListener("click", () => discard());
function discard() {
  localStorage.removeItem("bestBrain");
  localStorage.removeItem("loop");
}

function random() {
  return Math.random() * 0.8 - 0.4;
}
function generateCars(N: number, savedBrain?: Network) {
  const cars = [];
  for (let i = 0; i <= N; i++) {
    const car = new Car(road.getLaneCenter(1), 100, 30, 50);
    car.id = i;
    if (savedBrain) {
      for (let j = 0; j < savedBrain.layers.length; j++) {
        car.brain!.layers[j].bias = savedBrain.layers[j].bias + random();
        let nws = [] as number[][];
        savedBrain.layers[j].weights.forEach((w) => {
          let _nws = [] as number[];
          w.forEach((_w) => {
            const res = _w + random();
            if (res < 0) {
              _nws.push(0);
              return;
            }
            if (res > 1) {
              _nws.push(1);
            }
            _nws.push(res);
          });
          nws.push(_nws);
        });

        car.brain!.layers[j].weights = nws;
      }
      car.brain!.outputs = savedBrain.outputs;
      const newOutput = car.brain?.outputs.map((o) => o + random());
      car.brain!.outputs = newOutput!;
    }
    cars.push(car);
  }

  return cars;
}
function animate() {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  envCanvas.height = window.innerHeight;
  nnCanvas.height = window.innerHeight;

  envCtx!.save();
  nnCtx!.save();

  const _bestCar = cars.find(
    (c) => c.y == Math.min(...cars.map((c) => c.y)) && c.speed !== 0
  );

  // console.log("best car speed", _bestCar, cars[0].speed);

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
    if (cars[i].damaged) cars.splice(i, 1);
  }

  if (_bestCar && bestCar.id !== _bestCar?.id && _bestCar?.y - bestCar.y > 50)
    save();

  if (cars.length === 0 || !_bestCar) {
    // console.log(cars.length, _bestCar, bestCar);
    if (cars.length < N) save();
  } else {
    bestCar = _bestCar!;
  }

  envCtx!.translate(0, -bestCar!.y + envCanvas.height * 0.8);
  road.draw(envCtx!);
  for (let i = 0; i < traffic.length; i++) {
    if (traffic[i].y - bestCar.y < 100) {
      traffic[i].draw(envCtx!);
    } else {
      const newTraffic = new Car(traffic[i].x, bestCar.y - 800, 30, 50, true);
      // traffic.splice(i, 1);
      traffic[i] = newTraffic;
    }
  }
  envCtx!.globalAlpha = 0.2;
  for (let i = 1; i < cars.length; i++) {
    cars[i].draw(envCtx!);
  }
  envCtx!.globalAlpha = 1;

  bestCar!.draw(envCtx!, true);
  const forward = document.getElementById("forward");
  const reverse = document.getElementById("reverse");
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  if (bestCar?.controls.forward) {
    forward?.classList.add("active");
  } else {
    forward?.classList.remove("active");
  }
  if (bestCar?.controls.reverse) {
    reverse?.classList.add("active");
  } else {
    reverse?.classList.remove("active");
  }
  if (bestCar?.controls.left) {
    left?.classList.add("active");
  } else {
    left?.classList.remove("active");
  }
  if (bestCar?.controls.right) {
    right?.classList.add("active");
  } else {
    right?.classList.remove("active");
  }

  visualizer.drawNN(bestCar?.brain!);
  // test();
  requestAnimationFrame(animate);
}

// for (let i = 0; i < 5; i++) {
//   animate;
// }
