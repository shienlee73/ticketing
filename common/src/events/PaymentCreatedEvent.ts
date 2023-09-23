import { Subjects } from "./Subjects";

export interface PaymentCreatedEventData {
  id: string;
  orderId: string;
  stripeId: string;
}

export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated;
  data: PaymentCreatedEventData;
}
