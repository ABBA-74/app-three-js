class WindMillManager {
  constructor(wings) {
    this.wings = wings;
  }
  handleRotateWings(windSpeed) {
    if (!windSpeed) return;

    const speed = +windSpeed;
    const rotateSpeed = speed * 0.0003;

    if (this.wings) {
      this.wings.forEach((elObj) => {
        if (elObj) {
          elObj.rotation.x += rotateSpeed;
        }
      });
    }
  }
}

export { WindMillManager };
