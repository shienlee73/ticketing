import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it("fetches orders for a particular user", async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  // Create one order as User #1
  const cookieOne = await global.signin();
  const orderOne = await request(app)
    .post("/api/orders")
    .set("Cookie", cookieOne)
    .send({ ticketId: ticketOne.id });
  expect(orderOne.status).toEqual(201);

  // Create one order as User #2
  const cookieTwo = await global.signin();
  const orderTwo = await request(app)
    .post("/api/orders")
    .set("Cookie", cookieTwo)
    .send({ ticketId: ticketTwo.id });
  expect(orderTwo.status).toEqual(201);
  const orderThree = await request(app)
    .post("/api/orders")
    .set("Cookie", cookieTwo)
    .send({ ticketId: ticketThree.id });
  expect(orderThree.status).toEqual(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookieTwo)
    .send();
  expect(response.status).toEqual(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderTwo.body.id);
  expect(response.body[1].id).toEqual(orderThree.body.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
