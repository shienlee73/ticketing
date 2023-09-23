import { Router, Request, Response } from "express";
import {
  AuthorizationError,
  NotFoundError,
  requireAuth,
} from "@tickets73/common";
import { Order } from "../models/Order";

const router = Router();

router.get(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.user!.id) {
      throw new AuthorizationError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
