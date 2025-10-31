// rome.js
import { getMap } from './map.js';
import { setBaseTileBounds } from './map.js';

let romeSoftenerLayer;

export async function applyRomeBoundsAndSoften() {
	const map = getMap();
	if (!map) return;

	const response = await fetch('./boundaries/geoJson/Roma.geojson');
	const data = await response.json();

	let romeBounds = null;

	// Compute bounds from geometry
	const tmp = L.geoJSON(data);
	romeBounds = tmp.getBounds && tmp.getBounds();
	if (romeBounds && romeBounds.isValid && romeBounds.isValid()) {
		// setBaseTileBounds(romeBounds);
	}

	// Create a subtle white overlay inside Rome to reduce visual detail
	if (!map.getPane('romeSoftPane')) {
		map.createPane('romeSoftPane');
		map.getPane('romeSoftPane').style.zIndex = 310; // above tiles, below vector overlays
		map.getPane('romeSoftPane').style.pointerEvents = 'none';
	}

	if (romeSoftenerLayer) {
		map.removeLayer(romeSoftenerLayer);
	}

	romeSoftenerLayer = L.geoJSON(data, {
		pane: 'romeSoftPane',
		style: () => ({
			color: '#ffffff',
			weight: 0,
			opacity: 0,
			fillColor: '#ffffff',
			fillOpacity: 0.2, // soften details within the city
		}),
	});

	romeSoftenerLayer.addTo(map);
}

export function removeRomeSoftener() {
	const map = getMap();
	if (romeSoftenerLayer && map) {
		map.removeLayer(romeSoftenerLayer);
		romeSoftenerLayer = undefined;
	}
}