import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export default function LoginScreen() {
  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setSession = useAuthStore((s) => s.setSession);

  async function requestOtp() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/request", { identifier });
      setChannel(data.data.channel);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { identifier, code, portal: "seller" });
      await setSession({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken, user: data.data.user });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MeiteiMart</Text>
      <Text style={styles.subtitle}>Seller App</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {step === "identifier" ? (
        <>
          <TextInput style={styles.input} placeholder="Registered email or mobile" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" />
          <TouchableOpacity style={styles.button} onPress={requestOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Sending..." : "Send OTP"}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.hint}>Enter OTP sent via {channel === "EMAIL" ? "email" : "SMS"}</Text>
          <TextInput style={styles.input} placeholder="123456" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} />
          <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Sign In"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" },
  title: { fontSize: 28, fontWeight: "bold", color: "#158a49" },
  subtitle: { color: "#6b7280", marginBottom: 24 },
  hint: { color: "#6b7280", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  button: { backgroundColor: "#158a49", borderRadius: 10, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 12 },
});
