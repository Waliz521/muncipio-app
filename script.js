import { initMap } from "./map.js";
import {
  loadDifferenceMask,
  loadCountriesMask,
  removeDifferenceMask,
  removeCountriesMask,
} from "./countries.js";
import { applyRomeBoundsAndSoften, removeRomeSoftener } from "./rome.js";
import {
  loadMunicipioBoundaries,
  handleMunicipioViewChange,
} from "./municipi.js";
import { loadHotels, handleHotelViewChange } from "./hotels.js";

window.onload = () => {
  initMap();
  // Apply Rome bounds to basemap and soften inside city
  // applyRomeBoundsAndSoften();
  // Load both dim layers and keep Italy visible
  loadCountriesMask();
  loadDifferenceMask();
  // Load municipi without changing the map view
  loadMunicipioBoundaries(true).then(() => {
    // Do not call handleMunicipioViewChange() here to avoid resetting view to Rome
    loadHotels();
  });
  // Mask toggle
  let maskEnabled = true;
  const maskBtn = document.getElementById("maskToggle");
  if (maskBtn) {
    maskBtn.addEventListener("click", () => {
      maskEnabled = !maskEnabled;
      if (maskEnabled) {
        loadCountriesMask();
        loadDifferenceMask();
        applyRomeBoundsAndSoften();
        maskBtn.textContent = "Hide Mask";
      } else {
        removeCountriesMask();
        removeDifferenceMask();
        removeRomeSoftener();
        maskBtn.textContent = "Show Mask";
      }
    });
  }
  document.getElementById("viewSelect").addEventListener("change", () => {
    handleMunicipioViewChange();
    handleHotelViewChange();
  });
  document
    .getElementById("starFilter")
    .addEventListener("change", handleHotelViewChange);
  window.handleHotelViewChange = handleHotelViewChange;
};
