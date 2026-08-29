import request from "supertest";
import app from "../app.js";
import { prisma } from "../utils/prismaConnection.js";

const TEST_EMAIL = "jest-test@example.com";
const TEST_PASSWORD = "Test@12345";
const TEST_NAME = "Jest Test User";

const SUPER_ADMIN_EMAIL = "jest-superadmin@example.com";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@12345";

export async function seedTestUser(role = "admin") {
  const bcrypt = await import("bcryptjs");
  const email = role === "super_admin" ? SUPER_ADMIN_EMAIL : TEST_EMAIL;
  const password = role === "super_admin" ? SUPER_ADMIN_PASSWORD : TEST_PASSWORD;
  const existing = await prisma.users.findFirst({ where: { email } });
  if (existing) return existing;
  return prisma.users.create({
    data: {
      name: role === "super_admin" ? "Jest Super Admin" : TEST_NAME,
      email,
      hasPassword: await bcrypt.hash(password, 10),
      role,
    },
  });
}

export async function cleanupTestUser() {
  await prisma.users.deleteMany({
    where: { email: { in: [TEST_EMAIL, SUPER_ADMIN_EMAIL] } },
  });
}

export function agent() {
  return request.agent(app);
}

export async function getCsrfToken(agentInstance) {
  const res = await agentInstance.get("/auth/csrf-token");
  return res.body.csrfToken;
}

export async function loginAs(agentInstance) {
  const csrfToken = await getCsrfToken(agentInstance);
  const res = await agentInstance
    .post("/auth/login")
    .set("x-csrf-token", csrfToken)
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
  return { status: res.status, csrfToken, res };
}

export async function superAdminAgent() {
  await seedTestUser("super_admin");
  const a = agent();
  const csrfRes = await a.get("/auth/csrf-token");
  const csrfToken = csrfRes.body.csrfToken;
  await a
    .post("/auth/login")
    .set("x-csrf-token", csrfToken)
    .send({ email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD });
  return a;
}

export { TEST_EMAIL, TEST_PASSWORD, TEST_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD };
