import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vite doesn't resolve Leaflet's default marker asset paths automatically — wire them up once.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const riderIcon = new L.DivIcon({
  className: "",
  html: '<div style="font-size:24px;line-height:1">🛵</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * Live delivery-tracking map: store, customer, and (if sharing) the delivery partner's
 * real-time position, connected by a straight line — the same visual language as
 * Swiggy/Zomato's rider-tracking screen, minus turn-by-turn road routing.
 */
export default function LiveTrackingMap({ storeLocation, customerLocation, riderLocation }) {
  const points = [storeLocation, riderLocation, customerLocation].filter(Boolean);
  const center = riderLocation || storeLocation || customerLocation || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={14} scrollWheelZoom={false} style={{ height: "16rem", width: "100%", borderRadius: "0.75rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {storeLocation && (
        <Marker position={[storeLocation.lat, storeLocation.lng]}>
          <Popup>Store</Popup>
        </Marker>
      )}
      {customerLocation && (
        <Marker position={[customerLocation.lat, customerLocation.lng]}>
          <Popup>Delivery address</Popup>
        </Marker>
      )}
      {riderLocation && (
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
          <Popup>Delivery partner</Popup>
        </Marker>
      )}
      {points.length > 1 && (
        <Polyline positions={points.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#158a49", dashArray: "6 6" }} />
      )}
    </MapContainer>
  );
}
