import { OrderCancelledEventData, OrderStatus } from "@tickets73/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledSubscriber } from "../OrderCancelledSubscriber";
import { natsWrapper } from "../../../NatsWrapper";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  const subscriber = new OrderCancelledSubscriber(natsWrapper.client);

  // Create a ticket
  const orderId = new Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: "asdf",
  });
  ticket.set({ orderId });
  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEventData = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, orderId, ticket, data, msg };
};

it("updates the ticket, publishes an event, and acks the message", async () => {
  const { subscriber, orderId, ticket, data, msg } = await setup();
  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});
