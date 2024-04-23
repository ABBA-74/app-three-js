/* Ma bare de recherche : 
- [x] : Récupérer la ville renseignée par mon visiteur
- [x] : À partir du nom va aller trouver la latitude 
et la longitude correspondantes
- BONUS : Si la ville renseignée n'est pas dans la base de données
(json) elle doit indiquer l'erreur au visiteur
- BONUS : Autocompletion dans les noms de villes
- BONUS : Enregistrer les dernières recherches 
*/

import { Wind } from './Wind.js';

class Search {
  constructor() {
    /* 1er temps = il sert à définir les variables, les propriétés */
    this.input = document.querySelector('.js-search-input');
    this.form = document.querySelector('.js-search-form');
    this.cities = [];
    /* 2nd temps = lancer les fonctions, les méthodes */
    this.init();
  }

  init() {
    /* Méthode pour lancer toutes les fonction de ma classe */
    this.getCities();
    this.watchUserInput();
  }

  watchUserInput() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.getLatLong();
    });
  }

  getLatLong() {
    const name = this.input.value;
    const cityData = this.getCityData(name);
    if (cityData) {
      const lat = cityData.lat;
      const long = cityData.lng;
      new Wind({ lat, long });
    } else {
      alert("La ville renseignée n'existe pas");
    }
  }

  getCities() {
    fetch('./data/france-cities.json')
      .then((response) => response.json())
      .then((data) => {
        this.cities = data;
      });
  }

  getCityDataWithFor(cityName) {
    const cityNameLower = cityName.toLowerCase();
    let cityData = {};
    for (const element of this.cities) {
      const cityNameInDataLower = element.city.toLowerCase();
      if (cityNameInDataLower === cityNameLower) {
        cityData = element;
        break;
      }
    }
    return cityData;
  }

  getCityData(userCityName) {
    const userCityNameLower = userCityName.toLowerCase();
    const data = this.cities.find(
      (cityObject) => cityObject.city.toLowerCase() === userCityNameLower
    );
    return data;
  }
}

export { Search };
