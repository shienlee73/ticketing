import { Publisher, Subjects, TicketCreatedEvent } from "@tickets73/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
