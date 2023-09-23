import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../NatsWrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).toEqual(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  const cookie = await global.signin();

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "", price: 10 });
  expect(response1.status).toEqual(400);

  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 10 });
  expect(response2.status).toEqual(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = await global.signin();

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "aowjfnkl", price: -10 });
  expect(response1.status).toEqual(400);

  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "aowjfnkl" });
  expect(response2.status).toEqual(400);
});

it("creates a ticket with valid inputs", async () => {
  const ticketsBefore = await Ticket.find({});
  expect(ticketsBefore.length).toEqual(0);

  const cookie = await global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "aowjfnkl", price: 10 });
  expect(response.status).toEqual(201);

  const ticketsAfter = await Ticket.find({});
  expect(ticketsAfter.length).toEqual(1);
  expect(ticketsAfter[0].title).toEqual("aowjfnkl");
  expect(ticketsAfter[0].price).toEqual(10);
});

it("publishes an event", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "aowjfnkl", price: 10 });
  expect(response.status).toEqual(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
