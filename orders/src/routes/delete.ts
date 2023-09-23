import { Router, Request, Response } from "express";
import {
  AuthorizationError,
  NotFoundError,
  requireAuth,
} from "@tickets73/common";
import { Order, OrderStatus } from "../models/Order";
import { natsWrapper } from "../NatsWrapper";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";

const router = Router();

router.delete(
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

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying that the order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
