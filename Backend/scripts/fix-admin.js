import { prisma } from "../utils/prismaConnection.js";
import bcrypt from "bcryptjs";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL || "superadmin@arivoholidays.com";
  const password = await ask("Enter new password for superadmin: ");
  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  await prisma.users.updateMany({
    where: { email },
    data: {
      hasPassword: passwordHash,
      isActive: true,
    },
  });
  console.log("Password reset successfully for:", email);
}

run()
  .catch(console.error)
  .finally(() => { rl.close(); prisma.$disconnect(); });
