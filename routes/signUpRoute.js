import { Router } from "express";
import { signup } from "../controllers/authUtils.js";
import userExists from "../middleware/userExistance.js";

const router = Router();

router.post("/", userExists, signup);

export default router;
