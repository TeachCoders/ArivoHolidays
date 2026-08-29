import { prisma } from "../utils/prismaConnection.js";
async function run() {
  const lead = await prisma.traveller.findUnique({
    where: { travellerId: 'TRV-1783012206119' },
    include: { vendor: true }
  });
  console.log(JSON.stringify(lead, null, 2));
}
run();
