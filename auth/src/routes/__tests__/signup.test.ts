import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  const response = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response.status).toEqual(201);
});

it("returns a 400 with an invaliad email", async () => {
  const response = await request(app).post("/api/users/signup").send({ email: "test@testcom", password: "password" });
  expect(response.status).toEqual(400);
});

it("returns a 400 with an invaliad password", async () => {
  const response = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "asd" });
  expect(response.status).toEqual(400);
});

it("returns a 400 with missing email and password", async () => {
  const response = await request(app).post("/api/users/signup").send({});
  expect(response.status).toEqual(400);
});

it("disallows deplicate emails", async () => {
  const response1 = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response1.status).toEqual(201);
  const response2 = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response2.status).toEqual(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response.status).toEqual(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});