import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { store } from './Store.js';

export default class ThreeScene {
  constructor() {
    this.loadFont();
    this.isWindTurbine1CorrectPos = false;
    this.isWindTurbine2CorrectPos = false;
    this.frameCount = 0;

    this.init();
  }

  init() {
    this.canvas = document.querySelector('.js-canvas');
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;

    // Créer une scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#020222');

    // Créer une caméra
    this.aspectRatio = this.canvasWidth / this.canvasHeight;
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio, 0.1, 1000);
    this.camera.position.set(-18, 12, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Créer un render
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);
    this.canvas.appendChild(this.renderer.domElement);
    // Ajouter lumière ambiante
    this.ambientLight = new THREE.AmbientLight(0x404040, 5);
    this.scene.add(this.ambientLight);

    // Charger un modèle GLTF
    this.loadModel();

    // Contrôles de caméra
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.setControls();

    // Démarrer l'animation
    this.animate();
  }

  getObjectFromScene(objectName) {
    return this.scene.getObjectByName(objectName);
  }

  initObjects() {
    this.wings = ['Ailes_1', 'Ailes_2'].map((name) => {
      return this.getObjectFromScene(name);
    });
    this.rotors = ['Rotor_eolienne_1', 'Rotor_eolienne_2'].map((name) => {
      return this.getObjectFromScene(name);
    });
    this.axes = ['Axis_eolienne_1', 'Axis_eolienne_2'].map((name) => {
      return this.getObjectFromScene(name);
    });
    this.spotlights = ['Light_eolienne_1', 'Light_eolienne_2'].map((name) => {
      return this.getObjectFromScene(name);
    });
    this.leds = ['Led_1', 'Led_2'].map((name) => {
      return this.getObjectFromScene(name);
    });
    this.radarflashes = ['Radar_flash_1', 'Radar_flash_2'].map((name) => {
      return this.getObjectFromScene(name);
    });
    this.needle = this.getObjectFromScene('Aiguille');
    this.car1 = this.getObjectFromScene('Car_1');
    this.car2 = this.getObjectFromScene('Car_2');
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      './assets/model.gltf',
      (gltf) => {
        this.scene.add(gltf.scene);
        // this.scene.traverse((object) => {
        //   console.log(object.name); // Affiche tous les noms d'objets dans la console
        // });

        this.setTextureCompass();
        this.setTextureWindSpeed();
        this.initObjects();
        this.resetAllRadarFlashes();
      },
      undefined,
      (error) => {
        console.error('An error happened', error);
      }
    );
  }

  setControls() {
    this.controls.minDistance = 10;
    this.controls.maxDistance = 50;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 3;
    this.controls.enablePan = false;
  }

  handleMoveCars() {
    if (!this.car1 || !this.car2) return;

    this.car1.speed = this.car1.speed || 0.03;
    this.car2.speed = this.car2.speed || -0.015;

    this.moveCar(this.car1, this.car1.speed, 30);
    this.moveCar(this.car2, this.car2.speed, -30);
  }

  getRandomSpeed() {
    return (Math.floor(Math.random() * 8) + 2) / 100;
  }

  moveCar(car, speed, boundary) {
    if (car.name == 'Car_1') {
      if (car.position.z > boundary) {
        car.speed = this.getRandomSpeed();
        car.position.z = -boundary;
      } else {
        this.controlSpeed(car);
        car.position.z += car.speed;
      }
    }
    if (car.name == 'Car_2') {
      if (car.position.z < boundary) {
        car.speed = -this.getRandomSpeed();
        car.position.z = -boundary;
      } else {
        this.controlSpeed(car);
        car.position.z += car.speed;
      }
    }
  }

  controlSpeed(car) {
    const speedLimite = 0.05;
    let isDistanceControlCar1 = false;
    let isDistanceControlCar2 = false;
    let ctrlRadarDistance = 5;
    if (car.name == 'Car_1') {
      isDistanceControlCar1 =
        Math.floor(car.position.z) > -ctrlRadarDistance &&
        Math.floor(car.position.z) < 0;
    } else {
      isDistanceControlCar2 =
        Math.floor(car.position.z) < ctrlRadarDistance &&
        Math.floor(car.position.z) > 0;
    }
    if (
      (isDistanceControlCar1 || isDistanceControlCar2) &&
      Math.abs(car.speed) > speedLimite
    ) {
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

  getScene() {
    return this.scene;
  }

  setTextureCompass() {
    const compass = this.getObjectFromScene('Compass');
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      './assets/wind-rose-compass.webp',
      function (texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.5, 1);
        texture.offset.set(0.25, 0);
      }
    );
    compass.material = new THREE.MeshBasicMaterial({ map: texture });
  }
  setTextureWindSpeed() {
    const compass = this.scene.getObjectByName('Wind_speed');
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      './assets/wind-speed.webp',
      function (texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    );
    const darkMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      color: 0xa003ff,
    });

    compass.material = darkMaterial;
  }

  //   findGroups() {
  //     const groups = [];
  //     this.scene.traverse((object) => {
  //       if (object.type === 'Group') {
  //         groups.push(object.name);
  //       }
  //     });
  //     console.log('Group names in the scene:', groups);
  //   }

  updatePositionNeedle() {
    const offset = 90;
    const windDirectionDeg = store.get('windDirectionDeg');

    if (windDirectionDeg !== undefined) {
      const formatNeedlePosX = this.roundNumber(this.needle.rotation.x);
      const formatWindDirectionRad = this.roundNumber(
        this.convertDegToRad(windDirectionDeg - offset)
      );
      if (formatNeedlePosX !== formatWindDirectionRad) {
        if (formatNeedlePosX < formatWindDirectionRad)
          this.needle.rotation.x += 0.001;
        if (formatNeedlePosX > formatWindDirectionRad)
          this.needle.rotation.x -= 0.001;
      }
    }
  }

  updateWindSpeed() {
    const windSpeedStored = store.get('windSpeedKmPerHour');
    if (windSpeedStored === undefined) return;
    if (this.prevSpeed == Math.floor(windSpeedStored)) return;

    this.windSpeed = Math.floor(windSpeedStored).toString();
    this.addWindSpeed(this.windSpeed);
  }

  loadFont() {
    const loader = new FontLoader();
    loader.load('assets/font/optimer_bold.typeface.json', (font) => {
      this.font = font;
      this.initTextMesh();
    });
  }
  initTextMesh() {
    const textGeometry = new TextGeometry('', {
      font: this.font,
      size: 1,
      depth: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 5,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
    this.textMesh.position.set(-7.2, 3, 0.8);
    this.textMesh.rotation.set(0, Math.PI / 2, 0);
    this.scene.add(this.textMesh);
  }

  handleColorWindSpeed() {
    const speed = +this.windSpeed;
    if (speed < 30) {
      this.clrWindSpeed = 'green';
    } else if (speed >= 30 && speed < 45) {
      this.clrWindSpeed = 'yellow';
    } else if (speed >= 45 && speed < 60) {
      this.clrWindSpeed = 'orange';
    } else if (speed >= 60) {
      this.clrWindSpeed = 'red';
    }
  }

  addWindSpeed(windSpeed) {
    if (windSpeed === undefined) return;

    this.handleColorWindSpeed();

    this.addUnitWindSpeed();

    if (!this.windSpeedMesh) {
      const textGeometry = new TextGeometry(windSpeed, {
        font: this.font,
        size: 1,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 5,
      });
      const textMaterial = new THREE.MeshBasicMaterial({
        color: this.clrWindSpeed,
      });
      this.windSpeedMesh = new THREE.Mesh(textGeometry, textMaterial);
      this.windSpeedMesh.position.set(-7.2, 3, 0.8);
      this.windSpeedMesh.rotation.set(0, Math.PI / 2, 0);
      this.scene.add(this.windSpeedMesh);
    } else {
      this.windSpeedMesh.geometry.dispose();
      this.windSpeedMesh.geometry = new TextGeometry(windSpeed, {
        font: this.font,
        size: 1,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 5,
      });
    }
    this.windSpeedMesh.material.color.set(this.clrWindSpeed);

    this.prevSpeed = this.windSpeed;
    this.updateRingsLight();
  }
  addUnitWindSpeed() {
    this.handleColorWindSpeed();
    const loader = new FontLoader();

    loader.load('assets/font/optimer_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('km/h', {
        font: font,
        size: 0.6,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 5,
      });
      const textMaterial = new THREE.MeshBasicMaterial({
        color: this.clrWindSpeed,
      });

      const unitMesh = new THREE.Mesh(textGeometry, textMaterial);
      unitMesh.position.set(-7.2, 2, 0.9);
      unitMesh.rotation.set(0, Math.PI / 2, 0);

      this.scene.add(unitMesh);
    });
  }

  updateRingsLight() {
    const ringLight1 = this.getObjectFromScene('Ring_light_1');
    const ringLight2 = this.getObjectFromScene('Ring_light_2');

    ringLight1.material.color.set(this.clrWindSpeed);
    ringLight2.material.color.set(this.clrWindSpeed);
  }
  convertDegToRad(valueDeg) {
    return valueDeg * (Math.PI / 180);
  }

  roundNumber(number) {
    return Math.floor(number * 1000) / 1000;
  }

  handleRotateWingsWindMill() {
    if (this.windSpeed === undefined) return;
    const speed = +this.windSpeed;
    const rotateSpeed = speed * 0.0003;

    if (this.wings) {
      this.wings.forEach((elObj) => {
        if (elObj) {
          elObj.rotation.x += rotateSpeed;
        }
      });
    }
  }

  handleRotorsWindTurbine() {
    if (this.windSpeed === undefined) return;
    const speed = +this.windSpeed;
    const rotateSpeed = speed * 0.0003;

    if (this.rotors) {
      this.rotors.forEach((elObj) => {
        if (elObj) {
          elObj.rotation.x += rotateSpeed;
        }
      });
    }
  }

  convertRadToDeg(valueRad) {
    return (valueRad * 180) / Math.PI;
  }

  handleAxesWindTurbine() {
    const windDirectionDeg = store.get('windDirectionDeg');
    if (windDirectionDeg === undefined || !this.axes) return;

    // this.handleSpotlightsWindTurbine();
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
      const targetRad = this.roundNumber(
        ((turbineOffset - windDirectionDeg) * Math.PI) / 180
      );
      let currentRad = this.roundNumber(turbine.rotation.y);

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

  handleSpotlightsWindTurbine() {
    if (!this.spotlights) return;

    this.spotlights.forEach((spotlight) => {
      spotlight.intensity = 0; // Initial intensity
      // this.leds.forEach((led) => {
      //   led.material.color.set('#ffffff');
      // });
      const toggleIntensity = () => {
        spotlight.intensity = spotlight.intensity === 0 ? 3 : 0;

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
  animate = () => {
    // Incrémenter frameCount à chaque trame
    this.frameCount++;
    // const start = performance.now();

    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    // const end = performance.now();
    // // console.log(`Frame took ${end - start} ms`);
    // if (end - start > 16.7) {
    //   // Log frames that take longer than 60 FPS frame time
    //   console.warn('Frame lag detected');
    // }
    // if (!this.car1) {
    //   this.getCar1FromScene();
    // }
    this.handleRotateWingsWindMill();
    this.handleRotorsWindTurbine();
    this.handleAxesWindTurbine();
    this.updatePositionNeedle();
    this.updateWindSpeed();
    this.handleMoveCars();
    // Appeler handleSpotlightsWindTurbine moins fréquemment
    if (this.frameCount % 1000 === 0) {
      this.resetTimerSpotlights();
      this.handleSpotlightsWindTurbine();
    }
  };
}
