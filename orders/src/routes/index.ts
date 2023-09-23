import { Router, Request, Response } from "express";
import { requireAuth } from "@tickets73/common";
import { Order } from "../models/Order";

const router = Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.user!.id,
  }).populate("ticket");

  res.send(orders);
});

export { router as indexOrderRouter };
