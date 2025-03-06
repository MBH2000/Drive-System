import express from "express";

import {
  getFileById,
  getFilesByFolderId,
  uploadFile,
} from "../controller/fileController";
import verifyToken from "../middlewares/auth";
import upload from "../middlewares/multer";

const router = express.Router();

router.post("/storefile", verifyToken, upload, uploadFile);
router.get("/folder/:folderId", verifyToken, getFilesByFolderId);
router.get("/:fileId", verifyToken, getFileById);
export default router;
