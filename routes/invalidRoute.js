import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(404).json({ message: "invalid route" });
});

export default router;
