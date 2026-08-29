import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../utils/prismaConnection.js";
import { seedTestUser, cleanupTestUser, TEST_EMAIL, TEST_PASSWORD } from "../helpers.js";

beforeAll(async () => {
  await seedTestUser();
});

afterAll(async () => {
  await cleanupTestUser();
  await prisma.$disconnect();
});

describe("POST /auth/login", () => {
  it("returns 200 on valid credentials", async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await agent
      .post("/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.info).toBeDefined();
    expect(res.body.info.email).toBe(TEST_EMAIL);
  });

  it("returns 400 on invalid email format", async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await agent
      .post("/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({ email: "not-an-email", password: "Test@12345" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 on wrong password", async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await agent
      .post("/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({ email: TEST_EMAIL, password: "WrongPassword123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 on non-existent email", async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await agent
      .post("/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({ email: "ghost@nowhere.com", password: "Test@12345" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /auth/me", () => {
  it("returns user info when logged in", async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    await agent
      .post("/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const res = await agent.get("/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.info.email).toBe(TEST_EMAIL);
    expect(res.body.info.role).toBe("admin");
  });

  it("returns 401 when not logged in", async () => {
    const agent = request.agent(app);
    const res = await agent.get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /auth/logout", () => {
  it("clears session on logout", async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    await agent
      .post("/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const logoutRes = await agent
      .post("/auth/logout")
      .set("x-csrf-token", csrfToken);
    expect(logoutRes.status).toBe(200);

    const meRes = await agent.get("/auth/me");
    expect(meRes.status).toBe(401);
  });
});
