import mongoose from "mongoose";
import { TICKET_STATUS } from "@meiteimart/shared";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachments: { type: [String], default: [] },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ["order", "payment", "delivery", "product", "account", "other"],
      default: "other",
    },
    status: { type: String, enum: Object.values(TICKET_STATUS), default: TICKET_STATUS.OPEN },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User", default: null },
    messages: { type: [messageSchema], default: [] },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  },
  { timestamps: true }
);

ticketSchema.index({ raisedBy: 1, createdAt: -1 });
ticketSchema.index({ assignedAgent: 1, status: 1 });

export const Ticket = mongoose.model("Ticket", ticketSchema);
