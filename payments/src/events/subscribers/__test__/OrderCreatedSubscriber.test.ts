import { OrderCreatedEventData, OrderStatus } from "@tickets73/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedSubscriber } from "../OrderCreatedSubscriber";
import { Order } from "../../../models/Order";

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

  const data: OrderCreatedEventData = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: new Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg };
};

it("replicate the order info", async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order).toBeDefined();
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
