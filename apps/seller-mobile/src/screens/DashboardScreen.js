import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export default function DashboardScreen() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const logout = useAuthStore((s) => s.logout);

  async function load() {
    try {
      const res = await api.get("/stores/me");
      setStore(res.data.data.store);
      const prodRes = await api.get("/products", { params: { store: res.data.data.store._id } });
      setProducts(prodRes.data.data.products);
    } catch {
      setStore(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{store?.name || "My Store"}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>
      {store ? (
        <Text style={styles.status}>Status: {store.status}</Text>
      ) : (
        <Text style={styles.status}>Set up your store from the Seller web dashboard.</Text>
      )}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.unit}>Stock: {item.stock} • ₹{item.price}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  logout: { color: "#dc2626" },
  status: { color: "#6b7280", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  productName: { fontWeight: "600" },
  unit: { color: "#6b7280", fontSize: 12 },
  empty: { color: "#6b7280", textAlign: "center", marginTop: 40 },
});
