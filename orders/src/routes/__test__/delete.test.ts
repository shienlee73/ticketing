import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { OrderStatus } from "@tickets73/common";
import { natsWrapper } from "../../NatsWrapper";

it("marks an order as cancelled", async () => {
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // make a request to create an order
  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId: ticket.id,
    });
  expect(response.status).toEqual(201);

  // make request to cancel the order
  const response2 = await request(app)
    .delete(`/api/orders/${response.body.id}`)
    .set("Cookie", cookie)
    .send();
  expect(response2.status).toEqual(204);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", cookie)
    .send();
  expect(updatedOrder.status).toEqual(200);

  expect(updatedOrder.body.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // Create an order
  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id });
  expect(response.status).toEqual(201);

  // Cancel the order
  const order = response.body;
  const response2 = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", cookie)
    .send();
  expect(response2.status).toEqual(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
