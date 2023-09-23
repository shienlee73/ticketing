import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { natsWrapper } from "../../NatsWrapper";
import { Ticket } from "../../models/Ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const cookie = await global.signin();

  const id = new mongoose.Types.ObjectId().toHexString();

  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdfhjkl",
      price: 10,
    });

  expect(response.status).toEqual(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const response = await request(app).put(`/api/tickets/${id}`).send({
    title: "asdfhjkl",
    price: 10,
  });

  expect(response.status).toEqual(401);
});

it("returns a 404 if the user does not own the ticket", async () => {
  const cookie1 = await global.signin();
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie1)
    .send({
      title: "asdfhjkl",
      price: 10,
    });

  const cookie2 = await global.signin();
  const response = await request(app)
    .put(`/api/tickets/${response1.body.id}`)
    .set("Cookie", cookie2)
    .send({
      title: "asdfhjklasdfhjkl",
      price: 20,
    });

  expect(response.status).toEqual(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = await global.signin();

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfhjkl",
      price: 10,
    });

  const response2 = await request(app)
    .put(`/api/tickets/${response1.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 10,
    });
  expect(response2.status).toEqual(400);

  const response3 = await request(app)
    .put(`/api/tickets/${response1.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdfhjkl",
      price: -10,
    });
  expect(response3.status).toEqual(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = await global.signin();

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfhjkl",
      price: 10,
    });

  const response2 = await request(app)
    .put(`/api/tickets/${response1.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdfhjklasdfhjkl",
      price: 20,
    });
  expect(response2.status).toEqual(200);

  const response3 = await request(app)
    .get(`/api/tickets/${response1.body.id}`)
    .send();
  expect(response3.status).toEqual(200);
  expect(response3.body.title).toEqual("asdfhjklasdfhjkl");
  expect(response3.body.price).toEqual(20);
});

it("publishes an event", async () => {
  const cookie = await global.signin();

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfhjkl",
      price: 10,
    });

  const response2 = await request(app)
    .put(`/api/tickets/${response1.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdfhjklasdfhjkl",
      price: 20,
    });
  expect(response2.status).toEqual(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = await global.signin();

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfhjkl",
      price: 10,
    });

  const ticket = await Ticket.findById(response1.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  const response2 = await request(app)
    .put(`/api/tickets/${response1.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdfhjklasdfhjkl",
      price: 20,
    });
  expect(response2.status).toEqual(400);
});
