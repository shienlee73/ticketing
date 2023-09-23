import { Router } from "express";
import { currentUser } from "@tickets73/common";

const router = Router();

router.get("/api/users/currentUser", currentUser, (req, res) => {
  res.send({ currentUser: req.user || null });
});

export { router as currentUserRouter };
