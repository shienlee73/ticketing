import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const response = await request(app).get(`/api/tickets/${id}`).send();
  expect(response.status).toEqual(404);
});

it("returns the ticket if the ticket is found", async () => {
  const cookie = await global.signin();

  const title = "concert";
  const price = 20;

  const response1 = await request(app).post("/api/tickets").set("Cookie", cookie).send({ title, price });

  const response2 = await request(app).get(`/api/tickets/${response1.body.id}`).send();
  expect(response2.status).toEqual(200);
  expect(response2.body.title).toEqual(title);
  expect(response2.body.price).toEqual(price);
});
