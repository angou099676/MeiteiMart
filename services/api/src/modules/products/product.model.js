import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },

    unit: { type: String, default: "1 pc" }, // e.g. "500 g", "1 L", "12 pcs"
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: "" },

    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ store: 1, slug: 1 }, { unique: true });
productSchema.index({ name: "text", tags: "text" });

export const Product = mongoose.model("Product", productSchema);
