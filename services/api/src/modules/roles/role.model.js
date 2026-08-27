import mongoose from "mongoose";

const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false }, // system roles cannot be deleted
    portals: { type: [String], default: [] }, // which portal(s) this role can log into
  },
  { timestamps: true }
);

export const Role = mongoose.model("Role", roleSchema);
