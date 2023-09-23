import {
  Subjects,
  Subscriber,
  PaymentCreatedEvent,
  PaymentCreatedEventData,
  OrderStatus,
} from "@tickets73/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/Order";

export class PaymentCreatedSubscriber extends Subscriber<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEventData, msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
