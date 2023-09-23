import { Publisher, OrderCreatedEvent, Subjects } from "@tickets73/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
