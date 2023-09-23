import { OrderCancelledEventData, OrderStatus } from "@tickets73/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCancelledSubscriber } from "../OrderCancelledSubscriber";
import { Order } from "../../../models/Order";

const setup = async () => {
  const subscriber = new OrderCancelledSubscriber(natsWrapper.client);

  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: "123",
    price: 10,
  });
  await order.save();

  const data: OrderCancelledEventData = {
    id: order.id,
    version: 1,
    ticket: {
      id: "123",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, order, data, msg };
};

it("updates the status of the order", async () => {
  const { subscriber, order, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { subscriber, order, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
