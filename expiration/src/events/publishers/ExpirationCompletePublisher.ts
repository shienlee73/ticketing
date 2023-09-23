import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@tickets73/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
