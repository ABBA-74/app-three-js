class Utils {
  static convertDegToRad(valueDeg) {
    return valueDeg * (Math.PI / 180);
  }

  static convertRadToDeg(valueRad) {
    return (valueRad * 180) / Math.PI;
  }

  static roundNumber(number) {
    return Math.floor(number * 1000) / 1000;
  }
}

export { Utils };
