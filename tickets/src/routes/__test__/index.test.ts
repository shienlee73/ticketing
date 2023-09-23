import request from "supertest";
import { app } from "../../app";

const createTicket = async () => {
  const cookie = await global.signin();

  await request(app).post("/api/tickets").set("Cookie", cookie).send({
    title: "asdfgh",
    price: 10,
  });
};

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get("/api/tickets").send();
  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(3);
});
