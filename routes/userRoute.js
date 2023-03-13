import { Router } from "express";
import { searchUser, searchUserCode } from "../controllers/searchUtils.js";

const router = Router();

router.get("/:username", searchUser);
router.get("/:username/id/:codeID", searchUserCode);

export default router;
