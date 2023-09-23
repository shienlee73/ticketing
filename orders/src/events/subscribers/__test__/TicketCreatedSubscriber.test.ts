import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedEventData } from "@tickets73/common";
import { natsWrapper } from "../../../NatsWrapper";
import { TicketCreatedSubscriber } from "../TicketCreatedSubscriber";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  // create an instance of the subscriber
  const subscriber = new TicketCreatedSubscriber(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEventData = {
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new Types.ObjectId().toHexString(),
    version: 0,
  };

  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, message };
};

it("create and save a ticket", async () => {
  const { subscriber, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await subscriber.onMessage(data, message);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { subscriber, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await subscriber.onMessage(data, message);

  // write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});
