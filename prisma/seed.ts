import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning database and seeding admin account...");

  // Delete all existing data
  await prisma.notification.deleteMany();
  await prisma.partnership.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.problemEditHistory.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany();

  // Create single Admin user
  const passwordHash = await bcrypt.hash("Admin@123JanSamadhan", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "JanSamadhan@admin.in",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Database reset complete!");
  console.log("Created Admin account:");
  console.log(`  Email: ${admin.email}`);
  console.log("  Password: Admin@123JanSamadhan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
