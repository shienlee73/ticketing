import { Subjects } from "./Subjects";

export interface OrderCancelledEventData {
  id: string;
  version: number;
  ticket: {
    id: string;
  };
}

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: OrderCancelledEventData;
}
