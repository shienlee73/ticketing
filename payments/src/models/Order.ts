import { Model, Document, Schema, model } from "mongoose";
import { OrderCancelledEventData, OrderStatus } from "@tickets73/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttrs {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface IOrder extends Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderModel extends Model<IOrder> {
  build(attrs: OrderAttrs): IOrder;
  findByEventData(event: OrderCancelledEventData): Promise<IOrder | null>;
}
const orderSchema = new Schema<IOrder>(
  {
    status: {
      type: String,
      require: true,
      enum: Object.values(OrderStatus),
    },
    userId: { type: String, require: true },
    price: { type: Number, require: true },
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
  return new Order({
    _id: attrs.id,
    status: attrs.status,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
  });
};

orderSchema.statics.findByEventData = (event: OrderCancelledEventData) => {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Order = model<IOrder, OrderModel>("Order", orderSchema);

export { Order, OrderStatus };
