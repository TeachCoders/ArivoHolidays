import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const gen = require('../generated/prisma/index.js');
const PrismaClient = gen.PrismaClient ?? gen.module?.exports?.PrismaClient ?? gen.default?.PrismaClient ?? gen.default ?? gen.PrismaClient;
const { PrismaPg } = require('@prisma/adapter-pg');
export const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.DATABASE_URL,
		poolOptions: { max: 5 },
	}),
});


