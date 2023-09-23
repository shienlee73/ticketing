import { Message } from "node-nats-streaming";
import {
  Subscriber,
  Subjects,
  OrderCreatedEvent,
  OrderCreatedEventData,
} from "@tickets73/common";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/Order";

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEventData, msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}
