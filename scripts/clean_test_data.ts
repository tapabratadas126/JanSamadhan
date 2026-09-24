import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanData() {
  console.log("🧹 Cleaning up all test problems and test users from database...");

  // Delete all test problems and associated data
  const deletedComments = await prisma.problemComment.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { user: { email: { contains: "@test.local" } } },
      ],
    },
  });

  const deletedUpvotes = await prisma.upvote.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { user: { email: { contains: "@test.local" } } },
      ],
    },
  });

  const deletedHistory = await prisma.problemEditHistory.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { editedBy: { email: { contains: "@test.local" } } },
      ],
    },
  });

  const deletedSolutions = await prisma.solution.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { university: { email: { contains: "@test.local" } } },
      ],
    },
  });

  const deletedProblems = await prisma.problem.deleteMany({
    where: {
      OR: [
        { title: { contains: "Test Problem" } },
        { title: { contains: "Admin Managed Problem" } },
        { postedBy: { email: { contains: "@test.local" } } },
      ],
    },
  });

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: { contains: "@test.local" },
    },
  });

  console.log(`✅ Deleted ${deletedProblems.count} test problems`);
  console.log(`✅ Deleted ${deletedUsers.count} test users`);
  console.log(`✅ Deleted ${deletedComments.count} test comments, ${deletedUpvotes.count} test upvotes, ${deletedSolutions.count} test solutions, ${deletedHistory.count} test edit logs.`);
}

cleanData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
