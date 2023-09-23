import { Message } from "node-nats-streaming";
import {
  Subjects,
  Subscriber,
  TicketCreatedEvent,
  TicketCreatedEventData,
} from "@tickets73/common";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/Ticket";

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEventData, msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    msg.ack();
  }
}
