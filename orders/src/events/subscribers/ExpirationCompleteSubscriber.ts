import { Message } from "node-nats-streaming";
import {
  Subscriber,
  ExpirationCompleteEvent,
  ExpirationCompleteEventData,
  Subjects,
  OrderStatus,
} from "@tickets73/common";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";

export class ExpirationCompleteSubscriber extends Subscriber<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEventData, msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
