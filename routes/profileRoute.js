import { Router } from "express";
import { getProfile } from "../controllers/profileUtils.js";
import verify from "../middleware/authMiddleware.js";
const router = Router();

router.get("/profile", verify, getProfile);

export default router;
