import { Publisher, Subjects, TicketUpdatedEvent } from "@tickets73/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
