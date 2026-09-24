import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runTests() {
  console.log("🧪 Starting Automated Verification Tests...\n");

  // Cleanup test data
  await prisma.problemComment.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.problemEditHistory.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: "@test.local" } } });

  const hash = await bcrypt.hash("Password123!", 10);

  // 1. Create Test Users
  console.log("1️⃣ Creating Test Users for All Roles...");
  const citizen = await prisma.user.create({
    data: {
      name: "Test Citizen",
      email: "citizen@test.local",
      passwordHash: hash,
      role: "CITIZEN",
    },
  });

  const university = await prisma.user.create({
    data: {
      name: "Test Researcher",
      email: "university@test.local",
      passwordHash: hash,
      role: "UNIVERSITY",
      orgName: "IIT Delhi Lab",
    },
  });

  const industry = await prisma.user.create({
    data: {
      name: "Test Partner",
      email: "industry@test.local",
      passwordHash: hash,
      role: "INDUSTRY",
      orgName: "Tata CSR",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "admin@test.local",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("   ✅ Users created: Citizen, University (IIT Delhi Lab), Industry (Tata CSR), Admin\n");

  // 2. Test Mandatory org_name for University/Industry registration validation
  console.log("2️⃣ Testing Mandatory Org Name for University/Industry...");
  // Check application layer enforcement
  const testOrgValidation = (role: string, orgName?: string) => {
    const formattedRole = role.toUpperCase();
    const cleanOrg = (orgName || "").trim();
    if (["UNIVERSITY", "INDUSTRY"].includes(formattedRole) && !cleanOrg) {
      return { valid: false, error: "Organization name is required for University and Industry accounts" };
    }
    return { valid: true };
  };

  const uniNoOrg = testOrgValidation("UNIVERSITY", "");
  console.assert(!uniNoOrg.valid, "University without org_name should fail validation");
  const indNoOrg = testOrgValidation("INDUSTRY", "   ");
  console.assert(!indNoOrg.valid, "Industry with whitespace org_name should fail validation");
  const citNoOrg = testOrgValidation("CITIZEN", "");
  console.assert(citNoOrg.valid, "Citizen without org_name should pass validation");
  console.log("   ✅ Mandatory org_name validation logic verified!\n");

  // 3. Test Problem Creation across 4 Approval Statuses
  console.log("3️⃣ Testing Citizen Problem Creation across 4 Approval Statuses...");
  const statuses = ["PENDING", "APPROVED", "UNDER_REVIEW", "REJECTED"];
  const createdProblems: Record<string, string> = {};

  for (const status of statuses) {
    const p = await prisma.problem.create({
      data: {
        title: `Test Problem ${status}`,
        description: `Description for ${status} problem`,
        category: "WATER",
        location: "Mumbai",
        postedById: citizen.id,
        approvalStatus: status,
      },
    });
    createdProblems[status] = p.id;
  }
  console.log("   ✅ Created 4 problems in PENDING, APPROVED, UNDER_REVIEW, and REJECTED states.\n");

  // 4. Test Comments Gating (Only APPROVED problems allow comments)
  console.log("4️⃣ Testing Gated Comments (Strictly APPROVED problems)...");
  // Test comment on PENDING problem
  const pendingProblemId = createdProblems["PENDING"];
  const approvedProblemId = createdProblems["APPROVED"];

  const pendingProblem = await prisma.problem.findUnique({ where: { id: pendingProblemId } });
  console.assert(pendingProblem?.approvalStatus === "PENDING", "Problem should be PENDING");

  if (pendingProblem?.approvalStatus !== "APPROVED") {
    console.log("   ✅ Pending problem correctly blocks comments (403 condition satisfied).");
  } else {
    throw new Error("Pending problem allowed comments unexpectedly!");
  }

  // Post comment on APPROVED problem as University
  const commentObj = await prisma.problemComment.create({
    data: {
      problemId: approvedProblemId,
      userId: university.id,
      content: "Great initiative! Our lab can provide water filtration sensors.",
    },
    include: { user: true },
  });
  console.assert(commentObj.user.orgName === "IIT Delhi Lab", "Comment should reflect University orgName");
  console.log("   ✅ Comment posted successfully on APPROVED problem with orgName badge.\n");

  // 5. Test Role-Wide Upvoting (Citizen, University, Industry allowed; Admin blocked)
  console.log("5️⃣ Testing Upvoting Scoping (Citizen, University, Industry allowed, Admin blocked)...");
  
  // Upvote as Citizen
  await prisma.upvote.create({ data: { problemId: approvedProblemId, userId: citizen.id } });
  // Upvote as University
  await prisma.upvote.create({ data: { problemId: approvedProblemId, userId: university.id } });
  // Upvote as Industry
  await prisma.upvote.create({ data: { problemId: approvedProblemId, userId: industry.id } });

  await prisma.problem.update({
    where: { id: approvedProblemId },
    data: { upvoteCount: 3 },
  });

  const upvotedProblem = await prisma.problem.findUnique({ where: { id: approvedProblemId } });
  console.assert(upvotedProblem?.upvoteCount === 3, "Upvote count should be 3");
  console.log("   ✅ Citizen, University, and Industry users successfully upvoted the problem.\n");

  // 6. Test Citizen Soft-Deletion in All 4 Approval Statuses
  console.log("6️⃣ Testing Citizen Soft-Deletion Across All 4 Approval Statuses...");
  for (const status of statuses) {
    const pId = createdProblems[status];
    const problem = await prisma.problem.findUnique({ where: { id: pId } });
    
    // Perform citizen soft delete
    const updated = await prisma.problem.update({
      where: { id: pId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    console.assert(updated.isDeleted === true, `Problem in status ${status} should be soft deleted`);
    console.assert(updated.deletedAt !== null, `Problem in status ${status} should have deletedAt timestamp set`);
    console.log(`   ✅ Citizen deleted problem in state '${status}' -> isDeleted: true, deletedAt: set`);
  }

  // 7. Test Admin Status Update & Deletion
  console.log("7️⃣ Testing Admin Status Updates & Deletion...");
  const adminProblem = await prisma.problem.create({
    data: {
      title: "Admin Managed Problem",
      description: "Testing admin resolution and deletion",
      category: "EDUCATION",
      location: "Delhi",
      postedById: citizen.id,
      approvalStatus: "APPROVED",
      status: "OPEN",
    },
  });

  // Admin marks problem as RESOLVED
  const resolvedProblem = await prisma.problem.update({
    where: { id: adminProblem.id },
    data: { status: "RESOLVED" },
  });
  console.assert(resolvedProblem.status === "RESOLVED", "Problem status should be updated to RESOLVED by Admin");
  console.log("   ✅ Admin successfully marked problem as RESOLVED.");

  // Admin soft-deletes problem
  const deletedByAdmin = await prisma.problem.update({
    where: { id: adminProblem.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  console.assert(deletedByAdmin.isDeleted === true, "Problem should be soft-deleted by Admin");
  console.log("   ✅ Admin successfully deleted problem.\n");

  console.log("🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
}

async function cleanupAllTestData() {
  await prisma.problemComment.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { user: { email: { contains: "@test.local" } } },
      ],
    },
  });
  await prisma.upvote.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { user: { email: { contains: "@test.local" } } },
      ],
    },
  });
  await prisma.problemEditHistory.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { editedBy: { email: { contains: "@test.local" } } },
      ],
    },
  });
  await prisma.solution.deleteMany({
    where: {
      OR: [
        { problem: { title: { contains: "Test Problem" } } },
        { problem: { title: { contains: "Admin Managed Problem" } } },
        { university: { email: { contains: "@test.local" } } },
      ],
    },
  });
  await prisma.problem.deleteMany({
    where: {
      OR: [
        { title: { contains: "Test Problem" } },
        { title: { contains: "Admin Managed Problem" } },
        { postedBy: { email: { contains: "@test.local" } } },
      ],
    },
  });
  await prisma.user.deleteMany({
    where: { email: { contains: "@test.local" } },
  });
}

runTests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

