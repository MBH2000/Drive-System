import express from "express";

import {
  getFileByIdAPI,
  uploadFileAPI,
} from "../controller/fileController";
import verifyToken from "../middlewares/auth";
import upload from "../middlewares/multer";

const router = express.Router();

router.post("/storefile", verifyToken, upload, uploadFileAPI);
router.get("/:fileId", verifyToken, getFileByIdAPI);
export default router;
