import { Model, Document, Schema, model } from "mongoose";

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface IPayment extends Document {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends Model<IPayment> {
  build(attrs: PaymentAttrs): IPayment;
}

const orderSchema = new Schema<IPayment>(
  {
    orderId: { type: String, require: true },
    stripeId: { type: String, require: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.statics.build = (attrs: IPayment) => {
  return new Payment(attrs);
};

const Payment = model<IPayment, PaymentModel>("Payment", orderSchema);

export { Payment };
