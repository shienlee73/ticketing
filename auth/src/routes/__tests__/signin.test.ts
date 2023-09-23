import request from "supertest";
import { app } from "../../app";

it("fails when a email that does not exist is sipplied", async () => {
  const response = await request(app).post("/api/users/signin").send({ email: "test@test.com", password: "password" });
  expect(response.status).toEqual(400);
});

it("fails when incorrect password is supplied", async () => {
  const response1 = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response1.status).toEqual(201);

  const response2 = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "passworda" });
  expect(response2.status).toEqual(400);
});

it("responds with a cookie when given valid credentials", async () => {
  const response1 = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response1.status).toEqual(201);

  const response2 = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" });
  expect(response2.get("Set-Cookie")).toBeDefined();
});
