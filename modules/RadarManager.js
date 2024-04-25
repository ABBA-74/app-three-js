class RadarManager {
  constructor(radarflashes) {
    this.speedLimite = 0.05;
    this.ctrlRadarDistance = 5;
    this.radarflashes = radarflashes;
  }

  controlSpeed(car) {
    const carPosition = Math.floor(car.position.z);
    const isDistanceControlled = this.isWithinRadarRange(car.name, carPosition);

    if (isDistanceControlled && Math.abs(car.speed) > this.speedLimite) {
      this.activeRadarFlash(car);
    }

    if (
      ((car.name === 'Car_2' && car.position.z < 0) ||
        (car.name === 'Car_1' && car.position.z > 0)) &&
      car.flashed
    ) {
      this.resetRadarFlash(car);
      car.position.z += car.speed;
    }
  }

  isWithinRadarRange(carName, position) {
    if (carName === 'Car_1') {
      return position < 0 && position > this.ctrlRadarDistance;
    } else if (carName === 'Car_2') {
      return position > 0 && position < this.ctrlRadarDistance;
    }
    return fase;
  }

  activeRadarFlash(car) {
    const radarIndex = car.name === 'Car_1' ? 1 : 0;
    this.radarflashes[radarIndex].intensity = 4;
    car.flashed = true;
  }

  resetRadarFlash(car) {
    const radarIndex = car.name === 'Car_1' ? 1 : 0;
    this.radarflashes[radarIndex].intensity = 0;
    car.flashed = false;
  }

  resetAllRadarFlashes() {
    this.radarflashes.forEach((flash) => {
      flash.intensity = 0;
    });
  }
}

export { RadarManager };
