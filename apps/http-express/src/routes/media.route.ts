import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { mediaCtrl, uploadMedia } from "../controllers/media.controller.js";
import { upload } from "../lib/multer.js";

export const mediaRouter: Router = Router();

/**
 * POST /api/v1/media/upload
 * Accepts multipart/form-data with fields: file, roomId, mediaKind
 * Stores binary in Redis with 20s TTL.
 * Returns { mediaId, mimeType, mediaKind } — client then sends private:media_ready over WS.
 */
mediaRouter.post(
  "/upload",
  verifyToken,
    upload.single("file"),
  uploadMedia

);

/**
 * GET /api/v1/media/:roomId/:mediaId
 * Single-fetch: Redis :viewed flag consumed atomically.
 * Returns binary on first call, 410 Gone on any subsequent call.
 */
mediaRouter.get(
  "/:roomId/:mediaId",
  verifyToken,
 mediaCtrl
);