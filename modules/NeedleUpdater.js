class NeedleUpdater {
  constructor(scene, object, valueDeg) {
    this.object = object;
    this.scene = scene;
    this.valueDeg = valueDeg;
    this.init();
  }

  init() {
    this.updatePosition(this.valueDeg);
  }

  convertDegToRad(valueDeg) {
    return valueDeg * (Math.PI / 180);
  }

  updatePosition(value) {
    this.object.rotation.set(
      new THREE.Vector3(0, 0, this.convertDegToRad(value))
    );
  }
}

export { NeedleUpdater };
