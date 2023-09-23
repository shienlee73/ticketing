import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/Order";
import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../NatsWrapper";

it("returns an error if the ticket does not exist", async () => {
  const cookie = await global.signin();
  const ticketId = new Types.ObjectId();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId });
  expect(response.status).toEqual(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "asdasd",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const cookie = await global.signin();
  const ticketId = ticket.id;
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId });
  expect(response.status).toEqual(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const cookie = await global.signin();
  const ticketId = ticket.id;
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId });
  expect(response.status).toEqual(201);
});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id });
  expect(response.status).toEqual(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
