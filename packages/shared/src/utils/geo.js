// Straight-line (haversine) distance in km — used for simple ETA estimates client & server side.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Rough ETA in minutes: travel time at an average city delivery speed + store prep time.
export function estimateEtaMinutes(distanceInKm, avgPrepTimeMinutes = 15, avgSpeedKmh = 22) {
  const travelMinutes = (distanceInKm / avgSpeedKmh) * 60;
  return Math.max(10, Math.round(travelMinutes + avgPrepTimeMinutes));
}
