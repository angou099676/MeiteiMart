import http from "node:http";
import { app } from "./app.js";
import { env, assertRequiredEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initSockets } from "./sockets/index.js";

async function bootstrap() {
  assertRequiredEnv();
  await connectDB();

  const httpServer = http.createServer(app);
  initSockets(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[api] MeiteiMart API listening on port ${env.port} (${env.nodeEnv})`);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });
}

bootstrap().catch((err) => {
  console.error("[bootstrap] Failed to start server:", err);
  process.exit(1);
});
