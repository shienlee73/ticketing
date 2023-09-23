import request from "supertest";
import mongoose from "mongoose";
import { OrderStatus } from "@tickets73/common";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { stripe } from "../../stripe";
import { Payment } from "../../models/Payment";

it("returns a 404 when purchasing an order that does not exist", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: "123",
    });

  expect(response.status).toEqual(404);
});

it("returns a 401 when purchasing an order that doesn't belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  const cookie = await global.signin();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ orderId: order.id, token: "123" });

  expect(response.status).toEqual(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  const cookie = await global.signin(order.userId);

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ orderId: order.id, token: "123" });

  expect(response.status).toEqual(400);
});

it("returns a 201 with valid inputs", async () => {
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: price,
    status: OrderStatus.Created,
  });
  await order.save();

  const cookie = await global.signin(order.userId);

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      orderId: order.id,
      token: "tok_visa",
    });
  expect(response.status).toEqual(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
