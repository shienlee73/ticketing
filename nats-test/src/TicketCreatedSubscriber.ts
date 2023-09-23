import { Message } from 'node-nats-streaming'
import {
    Subjects,
    Subscriber,
    TicketCreatedEvent,
    TicketCreatedEventData,
} from '@tickets73/common'

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
    queueGroupName = 'payments-service'

    onMessage(data: TicketCreatedEventData, msg: Message) {
        console.log('Event data!', data)
        msg.ack()
    }
}
