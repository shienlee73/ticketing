import { Publisher, Subjects, PaymentCreatedEvent } from "@tickets73/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
