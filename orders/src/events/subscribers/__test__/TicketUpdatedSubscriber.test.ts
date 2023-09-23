import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEventData } from "@tickets73/common";
import { natsWrapper } from "../../../NatsWrapper";
import { TicketUpdatedSubscriber } from "../TicketUpdatedSubscriber";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  // create an instance of the subscriber
  const subscriber = new TicketUpdatedSubscriber(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEventData = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new concert",
    price: 999,
    userId: new Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { subscriber, ticket, data, message };
};

it("finds, updates, and saves a ticket", async () => {
  const { subscriber, ticket, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await subscriber.onMessage(data, message);

  // write assertions to make sure a ticket was created!
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { subscriber, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await subscriber.onMessage(data, message);

  // write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});

it("it does not call ack if the event has a skipped version number", async () => {
  const { subscriber, ticket, data, message } = await setup();
  data.version = ticket.version + 2;

  try {
    await subscriber.onMessage(data, message);
  } catch (err) {}

  expect(message.ack).not.toHaveBeenCalled();
});
