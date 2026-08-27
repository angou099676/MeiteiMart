import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@meiteimart/shared";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    unit: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: "User", default: null },

    items: { type: [orderItemSchema], default: [] },
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    shippingAddress: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), default: PAYMENT_METHOD.COD },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },

    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PLACED },
    statusHistory: { type: [statusHistorySchema], default: [] },

    cancelReason: { type: String, default: "" },

    rating: {
      storeRating: { type: Number, min: 1, max: 5 },
      deliveryRating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
      ratedAt: { type: Date },
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ store: 1, createdAt: -1 });
orderSchema.index({ deliveryPartner: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
