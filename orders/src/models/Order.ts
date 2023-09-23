import { Model, Document, Schema, model } from "mongoose";
import { OrderStatus } from "@tickets73/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { ITicket } from "./Ticket";

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicket;
}

interface IOrder extends Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicket;
  version: number;
}

interface OrderModel extends Model<IOrder> {
  build(attrs: OrderAttrs): IOrder;
}
const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, require: true },
    status: {
      type: String,
      require: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Schema.Types.Date },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
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

orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: IOrder) => {
  return new Order(attrs);
};

const Order = model<IOrder, OrderModel>("Order", orderSchema);

export { Order, OrderStatus };
