import { getMap } from "./map.js";
import { getStatusColor, romanToNumber } from "./utils.js";
import { municipioLayers } from "./municipi.js";

let hotels = [];
let currentMarkers = [];
let currentHotel = null;

export async function loadHotels() {
  try {
    const response = await fetch('https://muncipio-app-3.onrender.com/hotels');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data)) throw new Error("Invalid data format");
    hotels = data.map((r) => ({
      id: r.id,
      hotel_name: r.hotel_name || r.Hotel_Name,
      latitude: Number(r.latitude || r.Latitude),
      longitude: Number(r.longitude || r.Longitude),
      star_rating: r.star_rating || r.Star_Rating,
      municipio: r.municipio || r.Municipio,
      status: r.status || r.Status,
      phase: r.phase || r.Phase,
      notes: r.notes || r.Notes,
      address: r.address || r.Address,
    }));
    console.log("[hotels] fetched", {
      count: hotels.length,
      sample: hotels.slice(0, 3),
    });
    handleHotelViewChange();
  } catch (error) {
    console.error("[hotels] fetch error", error);
    hotels = [];
    handleHotelViewChange();
  }
}
export function handleHotelViewChange() {
  const map = getMap();
  map.closePopup();
  currentMarkers.forEach((marker) => map.removeLayer(marker));
  currentMarkers = [];
  const currentZoom = map.getZoom();
  const initialRadius = getMarkerRadius(currentZoom);
  const view = document.getElementById("viewSelect").value;
  const starFilter = document.getElementById("starFilter").value;
  const normalizeMunicipioToNumber = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (/^\d+$/.test(trimmed)) return Number(trimmed);
      return romanToNumber(trimmed);
    }
    return 0;
  };
  const viewNum = normalizeMunicipioToNumber(view);
  let considered = 0,
    passedFilters = 0;
  console.log("[hotels] render", {
    view,
    viewNum,
    starFilter,
    total: hotels.length,
  });
  hotels.forEach((hotel) => {
    considered++;
    const hotelMunicipioNum = normalizeMunicipioToNumber(hotel.municipio);
    if (view !== "full" && hotelMunicipioNum !== viewNum) return;
    if (starFilter !== "all" && hotel.star_rating != parseInt(starFilter))
      return;
    passedFilters++;
    const marker = L.circleMarker([hotel.latitude, hotel.longitude], {
      radius: initialRadius,
      fillColor: getStatusColor(hotel.status),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(map);
    marker.hotelData = hotel;
    marker.on("click", onMarkerClick);
    currentMarkers.push(marker);
  });
  console.log(
    "[hotels] considered",
    considered,
    "rendered",
    currentMarkers.length,
    "passedFilters",
    passedFilters
  );
  if (view !== "full" && currentMarkers.length === 0) {
    const selectedMunicipio = municipioLayers.find(
      (layer) => layer.municipioId === romanToNumber(view)
    );
    if (selectedMunicipio) {
      const center = selectedMunicipio.getBounds().getCenter();
      L.popup()
        .setLatLng(center)
        .setContent(`No hotels data available for Municipio ${view}`)
        .openOn(map);
    }
    console.warn("[hotels] no markers after filtering", {
      view,
      viewNum,
      starFilter,
      total: hotels.length,
      sample: hotels.slice(0, 5),
    });
  }
}

function getSampleData() {
  return [
    {
      id: 1,
      hotel_name: "Hotel Excelsior",
      latitude: 41.90696714,
      longitude: 12.48310923,
      star_rating: 1,
      municipio: "I",
      status: "White",
      phase: null,
      notes: "",
    },
  ];
}

function getMarkerRadius(zoom) {
  const minSize = 3,
    maxSize = 8,
    zoomRange = 15;
  return minSize + ((zoom - 10) / zoomRange) * (maxSize - minSize);
}

function onMarkerClick(e) {
  const hotel = e.target.hotelData;
  console.log("[hotels] click", hotel);
  document.getElementById("popupName").textContent = hotel.hotel_name;
  document.getElementById("popupStars").textContent = "★".repeat(
    hotel.star_rating
  );
  document.getElementById("statusText").textContent = hotel.status;
  document.getElementById(
    "statusText"
  ).className = `status-text status-${hotel.status.toLowerCase()}`;
  document.getElementById("popupNotes").value = hotel.notes || "";
  document.getElementById("popupPhase").value = hotel.phase || "";
  const tech = document.getElementById("popupTech");
  if (tech) {
    const addressLine = hotel.address ? `${hotel.address}<br>` : "";
    const lat = Number(hotel.latitude);
    const lng = Number(hotel.longitude);
    const coordLine = `Lat: ${isFinite(lat) ? lat.toFixed(5) : "-"}, Lng: ${
      isFinite(lng) ? lng.toFixed(5) : "-"
    }`;
    tech.innerHTML = `${addressLine}${coordLine}`;
  }
  const phaseControls = document.querySelector(".phase-controls");
  if (hotel.status === "Green" || hotel.status === "Yellow")
    phaseControls.classList.remove("hidden");
  else phaseControls.classList.add("hidden");
  document.getElementById("popup").classList.remove("hidden");
  currentHotel = hotel;
}

function toggleStatusDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("statusDropdown");
  dropdown.classList.toggle("hidden");
}

function changeStatus(newStatus) {
  const statusTextEl = document.getElementById("statusText");
  statusTextEl.textContent = newStatus;
  statusTextEl.className = `status-text status-${newStatus.toLowerCase()}`;
  const dropdown = document.getElementById("statusDropdown");
  dropdown.classList.add("hidden");
  const phaseControls = document.querySelector(".phase-controls");
  if (newStatus === "Green" || newStatus === "Yellow")
    phaseControls.classList.remove("hidden");
  else {
    phaseControls.classList.add("hidden");
    document.getElementById("popupPhase").value = "";
  }
}

async function saveHotel() {
  if (!currentHotel) return;
  const id = currentHotel.id;
  const status = document.getElementById("statusText").textContent;
  const phaseVal = document.getElementById("popupPhase").value;
  const notes = document.getElementById("popupNotes").value;
  const phase = phaseVal === "" ? null : phaseVal;

  try {
    const response = await fetch(`/hotels/${id}`, {
      // Adjust endpoint
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        phase: phase ? Number(phase) : null,
        notes: notes || null,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const updated = { status, phase, notes };
    currentHotel.status = updated.status;
    currentHotel.phase = updated.phase;
    currentHotel.notes = updated.notes;
    const idx = hotels.findIndex((h) => h.id === id);
    if (idx !== -1) hotels[idx] = { ...hotels[idx], ...updated };
    const marker = currentMarkers.find(
      (m) => m.hotelData && m.hotelData.id === id
    );
    if (marker) {
      marker.hotelData = { ...marker.hotelData, ...updated };
      marker.setStyle({ fillColor: getStatusColor(updated.status) });
    }
    closePopup();
  } catch (err) {
    console.error("[hotels] save error", err);
    alert("Failed to save hotel. Please try again.");
  }
}
function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.add("hidden");
  const dropdown = document.getElementById("statusDropdown");
  dropdown.classList.add("hidden");
  currentHotel = null;
}

Object.assign(window, {
  toggleStatusDropdown,
  changeStatus,
  saveHotel,
  closePopup,
});