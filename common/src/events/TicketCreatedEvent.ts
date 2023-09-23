import { Subjects } from "./Subjects";

export interface TicketCreatedEventData {
  id: string;
  version: number;
  title: string;
  price: number;
  userId: string;
}

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: TicketCreatedEventData;
}
