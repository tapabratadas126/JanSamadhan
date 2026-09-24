const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.problem.updateMany({
    where: { approvalStatus: "PENDING" },
    data: { approvalStatus: "APPROVED" },
  });
  console.log("Updated " + result.count + " existing problems to APPROVED");
  await prisma["$disconnect"]();
}

main().catch(console.error);
