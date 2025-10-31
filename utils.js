// utils.js
export const ROME_CENTER = [41.9028, 12.4964];

export function romanToNumber(roman) {
  const romanMap = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
    XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15,
  };
  return romanMap[roman] || 0;
}

export function getMunicipioColor(municipioId) {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F8C471", "#82E0AA", "#F1948A", "#85C1E9", "#D7BDE2",
  ];
  return colors[municipioId - 1] || "#CCCCCC";
}

export function getStatusColor(status) {
  const colors = {
    White: "white", Green: "green", Yellow: "yellow", Red: "red"
  };
  return colors[status] || "gray";
}
