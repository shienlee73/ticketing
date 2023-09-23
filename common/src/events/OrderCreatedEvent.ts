import { Subjects } from "./Subjects";
import { OrderStatus } from "./types/OrderStatus";

export interface OrderCreatedEventData {
  id: string;
  version: number;
  status: OrderStatus;
  userId: string;
  expiresAt: string;
  ticket: {
    id: string;
    price: number;
  };
}

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: OrderCreatedEventData;
}
