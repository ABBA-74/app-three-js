import * as THREE from 'three';
import { FontLoader } from 'FontLoader';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { CarManager } from './CarManager.js';
import { NeedleManager } from './NeedleManager.js';
import { RadarManager } from './RadarManager.js';
import { store } from './Store.js';
import { TextureManager } from './TextureManager.js';
import { WindMillManager } from './WindMillManager.js';
import { WindSpeedColorUpdater } from './WindSpeedColorUpdater.js';
import { WindTurbineManager } from './WindTurbineManager.js';

export default class ThreeScene {
  constructor() {
    this.loadFont();
    this.frameCount = 0;

    this.init();
  }

  init() {
    this.canvas = document.querySelector('.js-canvas');
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;

    // Add a scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#020222');

    // Create camera
    this.aspectRatio = this.canvasWidth / this.canvasHeight;
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio, 0.1, 1000);
    this.camera.position.set(-18, 12, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Create render
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);
    this.canvas.appendChild(this.renderer.domElement);

    // Add ambient light
    this.ambientLight = new THREE.AmbientLight(0x405060, 5);
    this.ambientLight = new THREE.AmbientLight(0x404680, 3);
    this.scene.add(this.ambientLight);

    // load model GLTF
    this.loadModel();

    // Control camera
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.setControls();

    // Rerender on window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // Start animation
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getObjectFromScene(objectName) {
    return this.scene.getObjectByName(objectName);
  }

  initObjects() {
    const initObjectGroup = (names, key) => {
      return names.map((name) => this.getObjectFromScene(name));
    };

    // Initialization of object groups
    this.wings = initObjectGroup(['Ailes_1', 'Ailes_2']);
    const rotors = initObjectGroup(['Rotor_eolienne_1', 'Rotor_eolienne_2']);
    const axes = initObjectGroup(['Axis_eolienne_1', 'Axis_eolienne_2']);
    const spotlights = initObjectGroup([
      'Light_eolienne_1',
      'Light_eolienne_2',
    ]);
    const leds = initObjectGroup(['Led_1', 'Led_2']);
    this.cars = initObjectGroup(['Car_1', 'Car_2']);
    const radarflashes = initObjectGroup(['Radar_flash_1', 'Radar_flash_2']);
    this.ringIndicators = initObjectGroup(['Ring_light_1', 'Ring_light_2']);

    // Initialization of individual object
    const needle = this.getObjectFromScene('Aiguille');
    const compassBg = this.getObjectFromScene('Compass');
    const windSpeedBg = this.getObjectFromScene('Wind_speed');

    // Managers
    this.carManager = new CarManager(this.cars, radarflashes);
    this.radarManager = new RadarManager(radarflashes);
    this.textureManager = new TextureManager({ compassBg, windSpeedBg });
    this.windMillManager = new WindMillManager(this.wings);
    this.needleManager = new NeedleManager(needle);
    this.windTurbineManager = new WindTurbineManager({
      axes,
      leds,
      rotors,
      spotlights,
    });
  }

  static getScene() {
    return this.scene;
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

        this.initObjects();
        this.textureManager.setAllTextures();
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

  addWindSpeed(windSpeed) {
    if (windSpeed === undefined) return;

    this.addUnitWindSpeed();
    WindSpeedColorUpdater.updateClr(windSpeed);

    const textGeometry = this.createTextGeometry(windSpeed);
    const windSpeedColor = store.get('clrWindSpeed');

    if (!this.windSpeedMesh) {
      const textMaterial = new THREE.MeshBasicMaterial({
        color: windSpeedColor,
      });
      this.windSpeedMesh = new THREE.Mesh(textGeometry, textMaterial);
      this.windSpeedMesh.position.set(-7.2, 3, 0.8);
      this.windSpeedMesh.rotation.set(0, Math.PI / 2, 0);
      this.scene.add(this.windSpeedMesh);
    } else {
      this.windSpeedMesh.geometry.dispose();
      this.windSpeedMesh.geometry = textGeometry;
      this.windSpeedMesh.material.color.set(windSpeedColor);
    }

    this.prevSpeed = this.windSpeed;
    this.updateRingsLight();
  }

  createTextGeometry(windSpeed) {
    let textGeometry = new TextGeometry(windSpeed, {
      font: this.font,
      size: 1,
      depth: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 5,
    });
    return this.centerTextGeomtry(windSpeed, textGeometry);
  }

  // Centrer text geometry according to digit entries
  centerTextGeomtry(windSpeed, textGeometry) {
    let offset = 0;
    if (windSpeed.length > 2) {
      offset = -0.18;
    } else if (windSpeed.length === 1) {
      offset = 0.6;
    }

    textGeometry.computeBoundingBox();
    textGeometry.computeVertexNormals();

    const textWidth =
      textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textGeometry.translate(offset * textWidth, 0, 0);

    return textGeometry;
  }

  addUnitWindSpeed() {
    WindSpeedColorUpdater.updateClr(this.windSpeed);
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
        color: store.get('clrWindSpeed'),
      });

      const unitMesh = new THREE.Mesh(textGeometry, textMaterial);
      unitMesh.position.set(-7.2, 2, 0.9);
      unitMesh.rotation.set(0, Math.PI / 2, 0);

      this.scene.add(unitMesh);
    });
  }

  updateRingsLight() {
    this.ringIndicators.forEach((ring) => {
      ring.material.color.set(store.get('clrWindSpeed'));
    });
  }

  animate = () => {
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

    this.updateWindSpeed();

    if (this.windSpeed) {
      this.needleManager.updatePosition();
      this.windMillManager.handleRotateWings(this.windSpeed);
      this.windTurbineManager.handleMovmentWindTurbine(this.windSpeed);
    }
    if (this.cars) this.carManager.handleMoveCars();

    if (this.frameCount % 1000 === 0) {
      this.windTurbineManager.handleToggleSpotLights();
    }
  };
}
