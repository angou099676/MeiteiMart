// Centralised socket event names so backend emitters and every frontend's listeners never drift apart.
export const SOCKET_EVENTS = Object.freeze({
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Rooms
  JOIN_ORDER_ROOM: "order:join",
  LEAVE_ORDER_ROOM: "order:leave",
  JOIN_USER_ROOM: "user:join",

  // Orders
  ORDER_CREATED: "order:created",
  ORDER_STATUS_UPDATED: "order:status-updated",
  ORDER_ASSIGNED: "order:assigned",

  // Live tracking
  DELIVERY_LOCATION_UPDATE: "delivery:location-update",
  DELIVERY_LOCATION_BROADCAST: "delivery:location-broadcast",

  // Support chat
  TICKET_MESSAGE: "ticket:message",
  TICKET_STATUS_UPDATED: "ticket:status-updated",
  TICKET_TYPING: "ticket:typing",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
});
