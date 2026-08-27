import { Router } from "express";
import { z } from "zod";
import { PERMISSIONS } from "@meiteimart/shared";
import { Product } from "./product.model.js";
import { Store } from "../stores/store.model.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requirePermissions } from "../../middlewares/rbac.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

const router = Router();

const productSchema = z.object({
  category: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  unit: z.string().optional(),
  mrp: z.number().positive(),
  price: z.number().positive(),
  stock: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

// Public storefront listing (customer web/mobile)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, store, search, page = 1, limit = 24 } = req.query;
    const filter = { isActive: true, isApproved: true };
    if (category) filter.category = category;
    if (store) filter.store = store;
    if (search) filter.$text = { $search: String(search) };

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("store", "name logoUrl")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    return sendSuccess(res, { data: { products, total, page: Number(page), limit: Number(limit) } });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category").populate("store", "name logoUrl rating");
    if (!product) throw ApiError.notFound("Product not found");
    return sendSuccess(res, { data: { product } });
  })
);

router.use(requireAuth());

// Sellers create products for their own store; Admins can create/approve for any store.
router.post(
  "/",
  requirePermissions(PERMISSIONS.PRODUCT_CREATE),
  asyncHandler(async (req, res) => {
    const body = productSchema.parse(req.body);
    let storeId = req.body.store;

    if (!req.user.isSuperAdmin && req.user.role === "SELLER") {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) throw ApiError.badRequest("Seller has no store yet");
      storeId = store._id;
    }
    if (!storeId) throw ApiError.badRequest("store is required");

    const product = await Product.create({ ...body, store: storeId, isApproved: req.user.isSuperAdmin || req.user.role === "ADMIN" });
    return sendSuccess(res, { statusCode: 201, data: { product }, message: "Product created" });
  })
);

router.patch(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCT_UPDATE),
  asyncHandler(async (req, res) => {
    const body = productSchema.partial().parse(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound("Product not found");

    if (req.user.role === "SELLER" && !req.user.isSuperAdmin) {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store || String(product.store) !== String(store._id)) {
        throw ApiError.forbidden("You can only edit your own products");
      }
    }

    Object.assign(product, body);
    await product.save();
    return sendSuccess(res, { data: { product }, message: "Product updated" });
  })
);

router.patch(
  "/:id/approve",
  requirePermissions(PERMISSIONS.PRODUCT_APPROVE),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!product) throw ApiError.notFound("Product not found");
    return sendSuccess(res, { data: { product }, message: "Product approved" });
  })
);

router.delete(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCT_DELETE),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) throw ApiError.notFound("Product not found");
    return sendSuccess(res, { message: "Product deactivated" });
  })
);

export default router;
