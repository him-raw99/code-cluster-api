import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "yes the server is up" });
});

export default router;
