import { prisma } from '../utils/prismaConnection.js';
prisma.state.findUnique({where:{slug:'rajasthan'}}).then(console.log).finally(()=>prisma.$disconnect());
