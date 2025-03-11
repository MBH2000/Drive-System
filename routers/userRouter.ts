import express from "express";

import { registerUserAPI, loginUserAPI } from "../controller/userController";

const router = express.Router();

router.post("/register", registerUserAPI);

router.post("/login", loginUserAPI);

export default router;
