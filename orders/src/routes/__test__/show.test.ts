import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";

it("fetches the order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // make a request to build an order with this ticket
  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId: ticket.id,
    });
  expect(response.status).toEqual(201);
  // make request to fetch the order
  const response2 = await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", cookie)
    .send();
  expect(response2.status).toEqual(200);

  expect(response2.body.id).toEqual(response.body.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // make a request to build an order with this ticket
  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId: ticket.id,
    });
  expect(response.status).toEqual(201);
  // make request to fetch the order
  const cookie2 = await global.signin();
  const response2 = await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", cookie2)
    .send();
  expect(response2.status).toEqual(401);
});
