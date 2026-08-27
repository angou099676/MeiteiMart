import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

const PORTAL = import.meta.env.VITE_PORTAL || "seller";

export default function Login() {
  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [channel, setChannel] = useState("");
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function requestOtp(e) {
    e.preventDefault();
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

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { identifier, code, portal: PORTAL });
      setSession({ accessToken: data.data.accessToken, user: data.data.user });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-bold text-brand-700 mb-1">MeiteiMart</h1>
        <p className="text-gray-500 mb-6">Seller Portal</p>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
        {step === "identifier" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Registered email or mobile" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 font-medium disabled:opacity-50">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-gray-500">Enter OTP sent via {channel === "EMAIL" ? "email" : "SMS"}</p>
            <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="w-full border border-gray-300 rounded-lg px-3 py-2 tracking-widest text-center text-lg" />
            <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 font-medium disabled:opacity-50">
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
