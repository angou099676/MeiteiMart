import { Server } from "socket.io";
import { SOCKET_EVENTS } from "@meiteimart/shared";
import { verifyAccessToken } from "../services/tokenService.js";
import { env } from "../config/env.js";

let io = null;

export function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Missing auth token"));
      const payload = verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch (err) {
      next(new Error(`Invalid or expired token: ${err.message}`));
    }
  });

  io.on("connection", (socket) => {
    // Every authenticated user auto-joins their personal room for direct notifications.
    socket.join(`user:${socket.user.sub}`);

    socket.on(SOCKET_EVENTS.JOIN_ORDER_ROOM, (orderId) => socket.join(`order:${orderId}`));
    socket.on(SOCKET_EVENTS.LEAVE_ORDER_ROOM, (orderId) => socket.leave(`order:${orderId}`));
    socket.on("ticket:join", (ticketId) => socket.join(`ticket:${ticketId}`));
    socket.on("store:join", (storeId) => socket.join(`store:${storeId}`));

    socket.on(SOCKET_EVENTS.DELIVERY_LOCATION_UPDATE, ({ orderId, lat, lng }) => {
      io.to(`order:${orderId}`).emit(SOCKET_EVENTS.DELIVERY_LOCATION_BROADCAST, {
        orderId,
        deliveryPartnerId: socket.user.sub,
        lat,
        lng,
        at: new Date().toISOString(),
      });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      // no-op; rooms are cleaned up automatically by socket.io
    });
  });

  return io;
}

export function getIo() {
  return io;
}
