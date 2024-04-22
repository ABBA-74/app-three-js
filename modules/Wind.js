/* 
RÉCUPÉRER LES DONNÉES DE VENTS EN TEMPS RÉEL
- [x] Récupérer la direction du vent
- [x] Récupérer la vitesse du vent
- [ ] BONUS : Actualise mes données toutes les 15 minutes

https://api.open-meteo.com/v1/forecast?latitude=48.8567&longitude=2.3522&current=wind_speed_10m,wind_direction_10m&timezone=Europe%2FLondon
*/

import { NeedleUpdater } from './NeedleUpdater.js';
import ThreeScene from './ThreeScene.js';
import { store } from './Store.js';

class Wind {
  constructor(props) {
    const { lat, long } = props;
    this.lat = lat;
    this.long = long;
    this.url = '';
    this.init();
  }

  init() {
    this.buildUrl();
    this.getWindData();
  }

  buildUrl() {
    const base = 'https://api.open-meteo.com/v1/forecast';
    const requiredLatitude = 'latitude=' + this.lat;
    const requiredLongitude = 'longitude=' + this.long;

    const params = ['wind_speed_10m', 'wind_direction_10m'];
    const paramsStringList = params.join(',');

    this.url = `${base}?${requiredLatitude}&${requiredLongitude}&current=${paramsStringList}`;
  }

  getWindData() {
    fetch(this.url)
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        console.log('data', data.current.wind_direction_10m);
        /** -90 due to default position of nuddle */
        const windDirectionDeg = data.current.wind_direction_10m - 90;
        const windSpeedKmPerHour = data.current.wind_speed_10m * 3.6;
        // const threeScene = new ThreeScene();
        // threeScene.loadModel();
        // const scene = threeScene.getScene();
        // const needleObject = threeScene.getNeedleFromScene();
        // threeScene.updatePositionNeedle(windDirectionDeg);
        store.set('windDirectionDeg', windDirectionDeg);
        store.set('windSpeedKmPerHour', windSpeedKmPerHour);
        // console.log(scene, needleObject);
        // console.log(needleObject);
        // new NeedleUpdater(scene, needleObject, windDirectionDeg);
      });
  }
}

export { Wind };
