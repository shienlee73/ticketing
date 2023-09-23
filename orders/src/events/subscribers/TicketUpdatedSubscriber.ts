import { Message } from "node-nats-streaming";
import {
  Subjects,
  Subscriber,
  TicketUpdatedEvent,
  TicketUpdatedEventData,
} from "@tickets73/common";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/Ticket";

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEventData, msg: Message) {
    const { title, price } = data;

    const ticket = await Ticket.findByEventData(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
