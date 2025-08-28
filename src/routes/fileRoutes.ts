import multer from "multer";

import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import {
  uploadAndTranscribe,
  saveFileData,
  listUserFiles,
  getFileDetails,
  deleteUserFile,
} from "../controllers/fileController.ts";

const router = Router();

// Multer setup for temporary uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/temp/"),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // max 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "audio/mpeg") cb(null, true);
    else cb(new Error("Only MP3 files are allowed"));
  },
});

// Upload MP3 temporarily and transcribe instantly
router.post(
  "/upload-temp",
  authMiddleware,
  upload.single("file"),
  uploadAndTranscribe
);

router.post("/save-file", authMiddleware, saveFileData);
router.get("/my-files", authMiddleware, listUserFiles);
router.get("/:id", authMiddleware, getFileDetails);
router.delete("/:id", authMiddleware, deleteUserFile);

export default router;
