import { prisma } from "./utils/prismaConnection.js";
console.log(Object.keys(prisma).filter(k => !k.startsWith('_')));
