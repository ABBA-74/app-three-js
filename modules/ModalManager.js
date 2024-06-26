class ModalManager {
  constructor() {
    this.input = document.querySelector('.js-search-input');
    this.modal = document.querySelector('#modal');
    this.wrapperModal = document.querySelector('.wrapper-modal');
    this.btnClose = document.querySelector('.btn-close');
    this.mainMsg = document.querySelector('#modal .modal-main-msg');
    this.isModalOpened = false;
  }

  displayModal() {
    this.modal.style.display = 'block';
    this.wrapperModal.classList.add('active');
    this.btnClose.addEventListener('click', () => this.closeModal());
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.wrapperModal.classList.remove('active');
    this.isModalOpened = true;
  }

  handleMessageModal() {
    this.mainMsg.textContent =
      this.input.value === ''
        ? 'Merci de renseigner une ville.'
        : "La ville sélectionnée n'est pas répertoriée dans notre base de données. Veuillez choisir une autre ville.";
  }
}

export { ModalManager };
