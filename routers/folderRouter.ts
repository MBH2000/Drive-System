import express from "express";

import {
  createFolder,
  getFolder,
  shareFolder,
} from "../controller/folderController";
import verifyToken from "../middlewares/auth";

const router = express.Router();

router.post("/createfolder", verifyToken, createFolder);
router.get("/get/:folderId", verifyToken, getFolder);
router.post("/sharefolder", verifyToken, shareFolder);

export default router;
