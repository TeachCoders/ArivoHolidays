import pkg from './generated/prisma/index.js';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  console.log(users.map(u => ({ email: u.email, pass: u.hasPassword })));
}

main().finally(() => prisma.$disconnect());
