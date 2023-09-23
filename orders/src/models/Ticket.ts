import { Model, Document, Schema, model } from "mongoose";
import { TicketUpdatedEventData } from "@tickets73/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./Order";

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface ITicket extends Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends Model<ITicket> {
  build(attrs: TicketAttrs): ITicket;
  findByEventData(event: TicketUpdatedEventData): Promise<ITicket | null>;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: "version",
  }
);

ticketSchema.plugin(updateIfCurrentPlugin);
// ticketSchema.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//
//   done();
// });

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.statics.findByEventData = async (
  event: TicketUpdatedEventData
) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = model<ITicket, TicketModel>("Ticket", ticketSchema);

export { Ticket };
