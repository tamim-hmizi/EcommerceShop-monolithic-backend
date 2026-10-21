import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";

process.env.JWT_SECRET ??= "test-secret";
process.env.NODE_ENV = "test";

const { default: app } = await import("../app.js");
const { default: User } = await import("../models/User.js");

describe("monolith API", () => {
  before(async () => {
    const uri = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017";
    await mongoose.connect(uri, { dbName: `test-monolith-${process.pid}`, serverSelectionTimeoutMS: 60000 });
  });
  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
    );
  });
  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  const alice = { name: "Alice", email: "alice@example.com", password: "correct-horse-1" };

  async function login(user) {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password })
      .expect(200);
    return { Authorization: `Bearer ${res.body.data.token}` };
  }

  async function adminHeaders() {
    const admin = { name: "Admin", email: "admin@example.com", password: "admin-password-1" };
    await User.create({ ...admin, isAdmin: true });
    return login(admin);
  }

  describe("auth", () => {
    it("registers, rejects duplicates and logs in", async () => {
      await request(app).post("/api/auth/register").send(alice).expect(201);
      await request(app).post("/api/auth/register").send(alice).expect(400);
      await login(alice);
      await request(app)
        .post("/api/auth/login")
        .send({ email: alice.email, password: "wrong-password" })
        .expect(401);
    });

    it("validates registration input", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ ...alice, email: "not-an-email" })
        .expect(400);
      await request(app)
        .post("/api/auth/register")
        .send({ ...alice, password: "short" })
        .expect(400);
    });

    it("keeps the user list for admins only", async () => {
      await request(app).get("/api/users").expect(401);
      await request(app).post("/api/auth/register").send(alice).expect(201);
      await request(app).get("/api/users").set(await login(alice)).expect(403);
      await request(app).get("/api/users").set(await adminHeaders()).expect(200);
    });
  });

  describe("catalog", () => {
    it("lets admins create categories and products that anyone can read", async () => {
      const admin = await adminHeaders();
      const category = await request(app)
        .post("/api/category")
        .set(admin)
        .send({ name: "Shoes", description: "Running shoes" })
        .expect(201);
      const categoryId = category.body._id ?? category.body.data?._id;
      assert.ok(categoryId);

      await request(app)
        .post("/api/products")
        .set(admin)
        .field("name", "Trail runner")
        .field("description", "Lightweight trail shoe")
        .field("price", "89.9")
        .field("stock", "12")
        .field("category", categoryId)
        .expect(201);

      const products = await request(app).get("/api/products").expect(200);
      assert.match(JSON.stringify(products.body), /Trail runner/);
    });

    it("refuses catalog writes from customers", async () => {
      await request(app).post("/api/auth/register").send(alice).expect(201);
      await request(app)
        .post("/api/category")
        .set(await login(alice))
        .send({ name: "Bags", description: "Backpacks" })
        .expect(403);
    });

    it("rejects an invalid product id", async () => {
      await request(app).get("/api/products/not-an-id").expect(400);
    });
  });

  describe("platform", () => {
    it("returns 404 for unknown routes", async () => {
      await request(app).get("/api/does-not-exist").expect(404);
    });

    it("sets security headers", async () => {
      const res = await request(app).get("/api/products");
      assert.ok(res.headers["x-content-type-options"]);
    });
  });
});
