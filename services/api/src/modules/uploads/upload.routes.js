import { Router } from "express";
import { upload } from "../../middlewares/upload.js";
import { requireAuth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadToBlob } from "../../config/vercelBlob.js";

const router = Router();
router.use(requireAuth());

// Generic file upload used by every portal (product images, KYC docs, avatars, ticket attachments).
router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file provided");
    const folder = req.body.folder || "misc";
    const pathname = `${folder}/${req.user.id}/${Date.now()}-${req.file.originalname}`;
    const url = await uploadToBlob(pathname, req.file.buffer, req.file.mimetype);
    return sendSuccess(res, { statusCode: 201, data: { url }, message: "File uploaded" });
  })
);

export default router;
