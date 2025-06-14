const envCanvas = document.getElementById("envCanvas");
const nnCanvas = document.getElementById("nnCanvas");

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
const N = 1;
const cars = generateCars(N);
let bestCar = cars[0];
// if (localStorage.getItem("bestBrain")) {
//   // bestCar.brain.layers[2].bias = JSON.parse(
//   //   localStorage.getItem("bestBrain")
//   // );
//   const wb = JSON.parse(localStorage.getItem("bestBrain"));
//   cars.forEach((car) => {
//     console.log(car.brain.outputs);
//     car.brain.setWB(wb);
//     console.log(car.brain.outputs);
//     car.brain.mutate();
//   });
// }

const traffic = [];
// for (let i = 0; i < 2; i++) {
traffic.push(new Car(road.getLaneCenter(1), 100 - 200, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(0), 100 - 400, 30, 50, true));
traffic.push(new Car(road.getLaneCenter(2), 100 - 300, 30, 50, true));
// }
// const visualizer = new Visualizer(bestCar.brain, nnCtx);
animate();
function test() {
  if (localStorage.getItem("bestBrain")) {
    // bestCar.brain.layers[2].bias = JSON.parse(
    //   localStorage.getItem("bestBrain")
    // );
    const wb = JSON.parse(localStorage.getItem("bestBrain"));
    cars.forEach((car) => {
      console.log(car.brain.outputs);
      car.brain.setWB(wb);
      console.log(car.brain.outputs);
      // car.brain.mutate();
    });
  }
}

function save() {
  if (localStorage.getItem("bestBrain")) {
    discard();
  }
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  console.log(bestCar.brain.layers[2].bias);
  // const savedBrain = JSON.parse(localStorage.getItem("bestBrain"));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50));
  }
  return cars;
}

function animate() {
  // console.log(bestCar);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  envCanvas.height = window.innerHeight;
  nnCanvas.height = window.innerHeight;

  envCtx.save();
  nnCtx.save();

  const bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  envCtx.translate(0, -bestCar.y + envCanvas.height * 0.8);
  road.draw(envCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(envCtx);
  }
  envCtx.globalAlpha = 0.2;
  for (let i = 1; i < cars.length; i++) {
    cars[i].draw(envCtx);
  }
  envCtx.globalAlpha = 1;

  bestCar.draw(envCtx, true);
  // console.log(bestCar.sensor.readings);

  // visualizer.drawNN(bestCar.brain);
  // test();
  requestAnimationFrame(animate);
}
