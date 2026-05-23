import multer from "multer";

// Use memory storage — we pipe straight to Redis, no disk writes
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 30 * 1024 * 1024 }, // 30 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
    cb(null, allowed.includes(file.mimetype));
  },
});