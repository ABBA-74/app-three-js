import { Utils } from './Utils.js';
import { store } from './Store.js';

class WindTurbineManager {
  constructor(props) {
    const { axes, leds, rotors, spotlights } = props;
    this.axes = axes;
    this.leds = leds;
    this.rotors = rotors;
    this.spotlights = spotlights;

    this.isWindTurbine1CorrectPos = false;
    this.isWindTurbine2CorrectPos = false;
  }

  handleRotors(windSpeed) {
    if (windSpeed === undefined) return;
    const speed = +windSpeed;
    const rotateSpeed = speed * 0.00025;

    if (this.rotors) {
      this.rotors.forEach((elObj) => {
        if (elObj) {
          elObj.rotation.x += rotateSpeed;
        }
      });
    }
  }

  handleAxes() {
    const windDirectionDeg = store.get('windDirectionDeg');
    if (windDirectionDeg === undefined || !this.axes) return;

    const rotateSpeed = 0.001;
    const resetPosition =
      this.isWindTurbine1CorrectPos && this.isWindTurbine2CorrectPos;
    if (resetPosition) {
      this.isWindTurbine1CorrectPos = false;
      this.isWindTurbine2CorrectPos = false;
    }

    this.axes.forEach((turbine) => {
      if (!turbine) return;
      const turbineOffset = turbine.name === 'Axis_eolienne_1' ? 360 : 180;
      const targetRad = Utils.roundNumber(
        ((turbineOffset - windDirectionDeg) * Math.PI) / 180
      );
      let currentRad = Utils.roundNumber(turbine.rotation.y);

      if (targetRad !== currentRad) {
        turbine.rotation.y +=
          targetRad > currentRad ? rotateSpeed : -rotateSpeed;
      } else {
        if (turbine.name === 'Axis_eolienne_1') {
          this.isWindTurbine1CorrectPos = true;
        } else if (turbine.name === 'Axis_eolienne_2') {
          this.isWindTurbine2CorrectPos = true;
        }
      }
    });
  }

  setClrToLeds(clrHex) {
    this.leds.forEach((led) => {
      led.material.emissive.set(clrHex);
    });
  }

  toggleSpotlights() {
    if (!this.spotlights) return;

    this.spotlights.forEach((spotlight) => {
      spotlight.intensity = 0; // Initial intensity
      const toggleIntensity = () => {
        if (spotlight.intensity === 0) {
          this.setClrToLeds(0xff0000);
          spotlight.intensity = 3;
        } else {
          this.setClrToLeds(0x515151);
          spotlight.intensity = 0;
        }

        // Toggle intensity after a delay of 1000 ms
        spotlight.timeoutId = setTimeout(toggleIntensity, 1000);
      };

      // Start toggling intensity
      toggleIntensity();
    });
  }

  resetTimerSpotlights() {
    if (!this.spotlights) return;

    this.spotlights.forEach((spotlight) => {
      clearInterval(spotlight.timeoutId);
    });
  }

  handleToggleSpotLights() {
    this.resetTimerSpotlights();
    this.toggleSpotlights();
  }

  handleMovmentWindTurbine(windSpeed) {
    this.handleRotors(windSpeed);
    this.handleAxes();
  }
}

export { WindTurbineManager };
