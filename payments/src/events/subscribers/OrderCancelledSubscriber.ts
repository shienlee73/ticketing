import { Message } from "node-nats-streaming";
import {
  Subscriber,
  Subjects,
  OrderCancelledEvent,
  OrderCancelledEventData,
  OrderStatus,
} from "@tickets73/common";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/Order";

export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEventData, msg: Message) {
    const order = await Order.findByEventData(data);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
