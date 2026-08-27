import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

// Node's SRV resolver occasionally can't reach the OS-configured DNS server on Windows
// (VPNs/antivirus/some routers), even though the OS itself resolves fine. Fall back to
// public resolvers so `mongodb+srv://` connection strings work reliably.
dns.setServers([...dns.getServers(), "8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
  mongoose.connection.on("connected", () => {
    console.log("[db] MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  await mongoose.connect(env.mongoUri);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
