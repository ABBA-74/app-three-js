import { RadarManager } from './RadarManager.js';

class CarManager {
  constructor(cars, radarflashes) {
    this.cars = cars;
    this.radarManager = new RadarManager(radarflashes);
  }

  handleMoveCars() {
    if (!this.cars) return;

    // Distances of maximale deplacement before loop
    const FORWARD_TRAVEL_LIMIT = 30;
    const BACKWARD_TRAVEL_LIMIT = -30;

    // Config of speed and distance for each car
    const carConfigurations = [
      { index: 0, defaultSpeed: 0.03, travelLimit: FORWARD_TRAVEL_LIMIT },
      {
        index: 1,
        defaultSpeed: -0.015,
        travelLimit: BACKWARD_TRAVEL_LIMIT,
      },
    ];

    // Set config for each car
    carConfigurations.forEach(({ index, defaultSpeed, travelLimit }) => {
      const car = this.cars[index];
      car.speed = car.speed || defaultSpeed;
      this.moveCar(car, travelLimit);
    });
  }

  getRandomSpeed() {
    return (Math.floor(Math.random() * 8) + 3) / 100;
  }

  moveCar(car, travelLimit) {
    const shouldResetPosition =
      (car.name === 'Car_1' && car.position.z > travelLimit) ||
      (car.name === 'Car_2' && car.position.z < travelLimit);

    if (shouldResetPosition) {
      car.speed = (car.name === 'Car_1' ? 1 : -1) * this.getRandomSpeed();
      car.position.z = -travelLimit;
    } else {
      this.radarManager.controlSpeed(car);
      car.position.z += car.speed;
    }
  }
}

export { CarManager };
