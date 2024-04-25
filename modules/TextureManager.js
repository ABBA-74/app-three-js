import {
  TextureLoader,
  MeshBasicMaterial,
  LinearFilter,
  RepeatWrapping,
} from 'three';

class TextureManager {
  constructor(props) {
    const { compassBg, windSpeedBg } = props;
    this.compassBg = compassBg;
    this.windSpeedBg = windSpeedBg;
  }

  setTextureCompass() {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(
      './assets/wind-rose-compass.webp',
      function (texture) {
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.5, 1);
        texture.offset.set(0.25, 0);
      }
    );
    this.compassBg.material = new MeshBasicMaterial({ map: texture });
  }

  setTextureWindSpeed() {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(
      './assets/wind-speed.webp',
      function (texture) {
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.wrapS = texture.wrapT = RepeatWrapping;
      }
    );
    const darkMaterial = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      color: 0xa003ff,
    });

    this.windSpeedBg.material = darkMaterial;
  }

  setAllTextures() {
    this.setTextureCompass();
    this.setTextureWindSpeed();
  }
}

export { TextureManager };
