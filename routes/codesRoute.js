import { Router } from "express";
import verify from "../middleware/authMiddleware.js";
import {
  getAllCodes,
  postCode,
  getOneCode,
  deleteCode,
  updateCode,
} from "../controllers/codeUtils.js";
const router = Router();

router.get("/", verify, getAllCodes);
router.post("/", verify, postCode);
router.get("/:id", verify, getOneCode);
router.delete("/:id", verify, deleteCode);
router.put("/:id", verify, updateCode);

export default router;
