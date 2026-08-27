import mongoose from "mongoose";
import { DELIVERY_PARTNER_STATUS } from "@meiteimart/shared";

const { Schema } = mongoose;

const deliveryProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    vehicleType: { type: String, enum: ["bike", "bicycle", "scooter", "van"], default: "bike" },
    vehicleNumber: { type: String, default: "" },
    documents: {
      idProofUrl: String,
      drivingLicenseUrl: String,
    },
    status: { type: String, enum: Object.values(DELIVERY_PARTNER_STATUS), default: DELIVERY_PARTNER_STATUS.OFFLINE },
    isApproved: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryProfileSchema.index({ currentLocation: "2dsphere" });

export const DeliveryProfile = mongoose.model("DeliveryProfile", deliveryProfileSchema);
