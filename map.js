import { ROME_CENTER } from "./utils.js";

let map;
let baseTileLayer;
export function getMap() {
  return map;
}

export function initMap() {
  map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true,
    wheelDebounceTime: 20,
    wheelPxPerZoomLevel: 80,
    zoomAnimation: true,
    zoomSnap: 0.25,
    zoomDelta: 0.25,
    touchZoom: true,
    inertia: true,
    keyboard: true,
    boxZoom: true,
    preferCanvas: true,
    maxBoundsViscosity: 1.0,
  }).setView(ROME_CENTER, 10);
  baseTileLayer = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
    {
      maxZoom: 19,
      keepBuffer: 6,
      updateWhenIdle: true,
      updateWhenZooming: false,
      crossOrigin: true,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "png",
    }
  ).addTo(map);
}

export function setBaseTileBounds(bounds) {
  if (!map) return;
  if (baseTileLayer) {
    map.removeLayer(baseTileLayer);
  }
  baseTileLayer = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
    {
      maxZoom: 19,
      keepBuffer: 6,
      updateWhenIdle: true,
      updateWhenZooming: false,
      crossOrigin: true,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "png",
      bounds,
    }
  ).addTo(map);
}