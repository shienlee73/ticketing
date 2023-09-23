import { Publisher, OrderCancelledEvent, Subjects } from "@tickets73/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
