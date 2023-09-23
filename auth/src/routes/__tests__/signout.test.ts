import request from "supertest";
import { app } from "../../app";

it("clears the cookie after signing out", async () => {
  const response1 = await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "password" });
  expect(response1.status).toEqual(201);
  
  const response = await request(app).post("/api/users/signout").send({});
  expect(response.get('Set-Cookie')).toBeDefined();
});

