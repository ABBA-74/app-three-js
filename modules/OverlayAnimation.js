class OverlayAnimation {
  constructor() {
    this.overlayEl = document.querySelector('#overlay');
    this.init();
  }
  init() {
    this.overlayEl.addEventListener('animationend', () => {
      setTimeout(() => {
        this.overlayEl.remove();
      }, 4300);
    });
  }
}

export { OverlayAnimation };
