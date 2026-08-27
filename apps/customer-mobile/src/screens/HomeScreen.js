import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data.data.products));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hi, {user?.name?.split(" ")[0] || "there"} 👋</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.unit}>{item.unit}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products yet.</Text>}
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
  productName: { fontWeight: "600" },
  unit: { color: "#6b7280", fontSize: 12 },
  price: { marginTop: 6, fontWeight: "700", color: "#158a49" },
  empty: { color: "#6b7280", textAlign: "center", marginTop: 40 },
});
