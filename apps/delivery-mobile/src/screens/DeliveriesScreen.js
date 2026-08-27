import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { api } from "../lib/api.js";
import { connectSocket } from "../lib/socket.js";
import { useAuthStore } from "../store/authStore.js";

export default function DeliveriesScreen() {
  const [orders, setOrders] = useState([]);
  const [sharingOrderId, setSharingOrderId] = useState(null);
  const subscriptionRef = useRef(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  async function loadOrders() {
    const res = await api.get("/orders");
    setOrders(res.data.data.orders);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    await api.patch(`/orders/${orderId}/status`, { status });
    loadOrders();
  }

  async function startSharing(orderId) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const socket = connectSocket(accessToken);
    setSharingOrderId(orderId);
    subscriptionRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      async (loc) => {
        const { latitude: lat, longitude: lng } = loc.coords;
        socket.emit("delivery:location-update", { orderId, lat, lng });
        await api.post("/delivery/location", { lat, lng, orderId });
      }
    );
  }

  function stopSharing() {
    subscriptionRef.current?.remove();
    setSharingOrderId(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deliveries</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.status}>{item.status}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => updateStatus(item._id, "OUT_FOR_DELIVERY")}>
                <Text style={styles.action}>Out for delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateStatus(item._id, "DELIVERED")}>
                <Text style={styles.action}>Delivered</Text>
              </TouchableOpacity>
              {sharingOrderId === item._id ? (
                <TouchableOpacity onPress={stopSharing}>
                  <Text style={styles.action}>Stop sharing</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => startSharing(item._id)}>
                  <Text style={styles.action}>Share location</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No assigned deliveries yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  logout: { color: "#dc2626" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  orderNumber: { fontWeight: "600" },
  status: { color: "#158a49", fontWeight: "600", marginBottom: 8 },
  actions: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  action: { color: "#2563eb", fontSize: 12, marginRight: 12 },
  empty: { color: "#6b7280", textAlign: "center", marginTop: 40 },
});
