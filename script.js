let map;
let hotels = [];
let currentMarkers = [];

// Rome center coordinates
const ROME_CENTER = [41.9028, 12.4964];

// Initialize map
function initMap() {
  map = L.map("map").setView(ROME_CENTER, 12);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution: "© OpenStreetMap, © CartoDB",
    }
  ).addTo(map);

  loadHotels();
}

// Load hotels from backend
async function loadHotels() {
  try {
    const response = await fetch("/api/hotels");
    hotels = await response.json();
    renderMarkers();
  } catch (error) {
    console.error("Error loading hotels:", error);
    // Fallback to sample data if backend not ready
    hotels = getSampleData();
    renderMarkers();
  }
}

// Render markers on map
function renderMarkers() {
  // Clear existing markers
  currentMarkers.forEach((marker) => map.removeLayer(marker));
  currentMarkers = [];

  const view = document.getElementById("viewSelect").value;
  const starFilter = document.getElementById("starFilter").value;

  // Set zoom based on view
  if (view === "full") {
    map.setView(ROME_CENTER, 12);
  } else {
    // Zoom to Municipio I area
    map.setView([41.9, 12.48], 14);
  }

  hotels.forEach((hotel) => {
    // Apply filters
    if (view !== "full" && hotel.municipio !== view) return;
    if (starFilter !== "all" && hotel.star_rating != starFilter) return;

    const marker = L.circleMarker([hotel.latitude, hotel.longitude], {
      radius: 8,
      fillColor: getStatusColor(hotel.status),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(map);

    // Add phase number for green/yellow status
    if (hotel.status === "Green" || hotel.status === "Yellow") {
      marker.bindTooltip(hotel.phase?.toString() || "1", {
        permanent: true,
        direction: "center",
        className: "phase-tooltip",
      });
    } else if (hotel.status === "White") {
      marker.bindTooltip("?", {
        permanent: true,
        direction: "center",
        className: "phase-tooltip",
      });
    }

    marker.hotelData = hotel;
    marker.on("click", onMarkerClick);
    currentMarkers.push(marker);
  });
}

// Get color based on status
function getStatusColor(status) {
  const colors = {
    White: "white",
    Green: "green",
    Yellow: "yellow",
    Red: "red",
  };
  return colors[status] || "gray";
}

// Marker click handler
function onMarkerClick(e) {
  const hotel = e.target.hotelData;
  document.getElementById("popupName").textContent = hotel.hotel_name;
  document.getElementById("popupStars").textContent = "★".repeat(
    hotel.star_rating
  );
  document.getElementById("popupStatus").value = hotel.status;
  document.getElementById("popupNotes").value = hotel.notes || "";
  document.getElementById("popupPhase").value = hotel.phase || "1";

  // Show/hide phase controls based on status
  const phaseControls = document.querySelector(".phase-controls");
  if (hotel.status === "Green" || hotel.status === "Yellow") {
    phaseControls.classList.remove("hidden");
  } else {
    phaseControls.classList.add("hidden");
  }

  document.getElementById("popup").classList.remove("hidden");
  currentHotel = hotel;
}

// Close popup
function closePopup() {
  document.getElementById("popup").classList.add("hidden");
  currentHotel = null;
}

// Save hotel changes
async function saveHotel() {
  if (!currentHotel) return;

  const notes = document.getElementById("popupNotes").value;
  const status = document.getElementById("popupStatus").value;
  const phase =
    status === "Green" || status === "Yellow"
      ? parseInt(document.getElementById("popupPhase").value)
      : null;

  try {
    const response = await fetch(
      `http://localhost:5000/api/hotels/${currentHotel.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes,
          status: status,
          phase: phase,
        }),
      }
    );

    if (response.ok) {
      closePopup();
      loadHotels(); // Refresh markers to show new colors
    }
  } catch (error) {
    console.error("Error saving hotel:", error);
  }
}

// Event listeners
document.getElementById("viewSelect").addEventListener("change", renderMarkers);
document.getElementById("starFilter").addEventListener("change", renderMarkers);

// Sample data fallback
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
    // Add more sample data as needed
  ];
}

// Initialize when page loads
window.onload = initMap;
