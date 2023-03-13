import { Router } from "express";
import { login } from "../controllers/authUtils.js";
const router = Router();

router.post("/", login);

export default router;
