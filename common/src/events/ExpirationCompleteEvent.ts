import { Subjects } from "./Subjects";

export interface ExpirationCompleteEventData {
  orderId: string;
}

export interface ExpirationCompleteEvent {
  subject: Subjects.ExpirationComplete;
  data: ExpirationCompleteEventData;
}
