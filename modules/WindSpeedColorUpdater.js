import { store } from './Store.js';

class WindSpeedColorUpdater {
  static updateClr(windSpeed) {
    if (windSpeed === undefined || windSpeed === null) return;

    const speed = +windSpeed;

    if (speed < 30) {
      store.set('clrWindSpeed', 'green');
      return;
    }
    if (speed < 45) {
      store.set('clrWindSpeed', 'yellow');
      return;
    }
    if (speed < 60) {
      store.set('clrWindSpeed', 'orange');
      return;
    }
    store.set('clrWindSpeed', 'red');
  }
}

export { WindSpeedColorUpdater };
