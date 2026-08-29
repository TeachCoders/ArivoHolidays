import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../utils/prismaConnection.js";
import { superAdminAgent, cleanupTestUser } from "../helpers.js";

let adminAgent;
let teamId;

beforeAll(async () => {
  adminAgent = await superAdminAgent();
});

afterAll(async () => {
  if (teamId) {
    await prisma.teams.deleteMany({ where: { id: teamId } });
  }
  await cleanupTestUser();
  await prisma.$disconnect();
});

describe("POST /teams", () => {
  it("creates a team with valid data", async () => {
    const csrfRes = await adminAgent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await adminAgent
      .post("/teams")
      .set("x-csrf-token", csrfToken)
      .send({ name: "Jest Test Team", description: "A test team" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe("Jest Test Team");
    teamId = res.body.data.id;
  });

  it("returns 400 when name is missing", async () => {
    const csrfRes = await adminAgent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await adminAgent
      .post("/teams")
      .set("x-csrf-token", csrfToken)
      .send({ description: "No name team" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 409 on duplicate name", async () => {
    const csrfRes = await adminAgent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await adminAgent
      .post("/teams")
      .set("x-csrf-token", csrfToken)
      .send({ name: "Jest Test Team", description: "Duplicate" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /teams", () => {
  it("returns list of teams", async () => {
    const res = await adminAgent.get("/teams");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((t) => t.id === teamId);
    expect(found).toBeDefined();
    expect(found.name).toBe("Jest Test Team");
  });
});

describe("PUT /teams/:id", () => {
  it("updates team name", async () => {
    const csrfRes = await adminAgent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await adminAgent
      .put(`/teams/${teamId}`)
      .set("x-csrf-token", csrfToken)
      .send({ name: "Jest Updated Team", description: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Jest Updated Team");
  });
});

describe("DELETE /teams/:id", () => {
  it("soft-deletes a team", async () => {
    const csrfRes = await adminAgent.get("/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    const res = await adminAgent
      .delete(`/teams/${teamId}`)
      .set("x-csrf-token", csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("team is soft-deleted (isActive=false) in GET /teams", async () => {
    const res = await adminAgent.get("/teams");
    const found = res.body.data.find((t) => t.id === teamId);
    expect(found).toBeDefined();
    expect(found.isActive).toBe(false);
  });
});
