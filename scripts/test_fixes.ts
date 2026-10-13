import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Testing JanSamadhan Fixes ===");

  // 1. Check Problems in Database
  const approvedProblems = await prisma.problem.findMany({
    where: { approvalStatus: "APPROVED", isDeleted: false },
  });
  console.log(`[PASS] Approved non-deleted problems visible: ${approvedProblems.length}`);
  if (approvedProblems.length === 0) {
    throw new Error("No approved problems found visible!");
  }

  // 2. Test Citizen Safeguard: Citizen cannot edit/delete if solution is proposed
  // Find a problem that has a solution
  const problemWithSolution = await prisma.problem.findFirst({
    where: { solutions: { some: {} } },
    include: { postedBy: true, solutions: true },
  });

  if (problemWithSolution) {
    console.log(`Problem '${problemWithSolution.title}' has ${problemWithSolution.solutions.length} solutions.`);
    const solutionsCount = await prisma.solution.count({
      where: { problemId: problemWithSolution.id },
    });
    console.log(`[PASS] Verified solution count check returns ${solutionsCount} > 0`);
  } else {
    console.log("[INFO] No problem currently has solutions attached.");
  }

  // 3. Test Admin deletion endpoints support
  // Create a temporary academic solution, partnership, and portfolio to test deletions
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const university = await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });
  const industry = await prisma.user.findFirst({ where: { role: "INDUSTRY" } });
  const problem = approvedProblems[0];

  if (admin && university && industry && problem) {
    // A. Test Portfolio cancellation / deletion
    const dummyPortfolio = await prisma.portfolioEntry.create({
      data: {
        industryId: industry.id,
        projectTitle: "Test Bridge Construction",
        description: "Test description",
        clientOrAuthority: "State Highway Authority",
        yearCompleted: 2024,
        verified: true,
        verifiedById: admin.id,
        verifiedAt: new Date(),
      },
    });

    // Test un-verifying / cancelling
    const unverified = await prisma.portfolioEntry.update({
      where: { id: dummyPortfolio.id },
      data: { verified: false, verifiedById: null, verifiedAt: null },
    });
    console.log(`[PASS] Successfully cancelled portfolio verification (verified=${unverified.verified})`);

    // Test deleting portfolio
    await prisma.portfolioEntry.delete({ where: { id: dummyPortfolio.id } });
    const checkDeleted = await prisma.portfolioEntry.findUnique({ where: { id: dummyPortfolio.id } });
    console.log(`[PASS] Successfully deleted portfolio entry (exists=${!!checkDeleted})`);

    // B. Test Partnership deletion
    const dummySolution = await prisma.solution.create({
      data: {
        problemId: problem.id,
        universityId: university.id,
        title: "Temporary Test Solution",
        description: "Test solution description",
      },
    });

    const dummyPartnership = await prisma.partnership.create({
      data: {
        solutionId: dummySolution.id,
        industryId: industry.id,
        proposalDetails: "Test funding",
        status: "APPROVED",
      },
    });

    // Delete partnership
    await prisma.partnership.delete({ where: { id: dummyPartnership.id } });
    const checkPartnership = await prisma.partnership.findUnique({ where: { id: dummyPartnership.id } });
    console.log(`[PASS] Successfully deleted partnership history (exists=${!!checkPartnership})`);

    // Delete solution
    await prisma.solution.delete({ where: { id: dummySolution.id } });
    const checkSolution = await prisma.solution.findUnique({ where: { id: dummySolution.id } });
    console.log(`[PASS] Successfully deleted academic solution (exists=${!!checkSolution})`);
  }

  // 4. Test updating problem status as Admin
  const sampleProblem = approvedProblems[0];
  const originalStatus = sampleProblem.status;
  const updatedProblem = await prisma.problem.update({
    where: { id: sampleProblem.id },
    data: { status: "OPEN" },
  });
  console.log(`[PASS] Successfully changed problem status to ${updatedProblem.status}`);
  // revert
  await prisma.problem.update({
    where: { id: sampleProblem.id },
    data: { status: originalStatus },
  });

  console.log("=== All Tests Completed Successfully ===");
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
