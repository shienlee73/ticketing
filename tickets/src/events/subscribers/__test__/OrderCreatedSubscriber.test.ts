import { OrderCreatedEventData, OrderStatus } from "@tickets73/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedSubscriber } from "../OrderCreatedSubscriber";
import { natsWrapper } from "../../../NatsWrapper";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

  // Create a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: "asdf",
  });
  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEventData = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asdf",
    expiresAt: "asdf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, ticket, data, msg };
};

it("sets the orderId of the ticket", async () => {
  const { subscriber, ticket, data, msg } = await setup();
  await subscriber.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { subscriber, data, msg } = await setup();
  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { subscriber, data, msg } = await setup();
  await subscriber.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
