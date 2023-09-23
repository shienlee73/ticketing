import { ExpirationCompleteEventData, OrderStatus } from "@tickets73/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { ExpirationCompleteSubscriber } from "../ExpirationCompleteSubscriber";
import { Order } from "../../../models/Order";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  const subscriber = new ExpirationCompleteSubscriber(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: "asdasd",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEventData = {
    orderId: order.id,
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { subscriber, ticket, order, data, message };
};

it("updates the order status to cancelled", async () => {
  const { subscriber, order, data, message } = await setup();
  await subscriber.onMessage(data, message);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
  const { subscriber, order, data, message } = await setup();
  await subscriber.onMessage(data, message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { subscriber, data, message } = await setup();
  await subscriber.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
