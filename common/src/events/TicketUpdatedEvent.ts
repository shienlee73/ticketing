import { Subjects } from "./Subjects";

export interface TicketUpdatedEventData {
  id: string;
  version: number;
  title: string;
  price: number;
  userId: string;
  orderId?: string;
}

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: TicketUpdatedEventData;
}
