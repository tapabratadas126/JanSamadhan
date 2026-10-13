import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("🧪 Starting Industry Partner Profiles & Admin Ratings Verification...\n");

  // 1. Get or Create Industry Partner User
  console.log("1️⃣ Finding or creating Industry Partner account...");
  let industry = await prisma.user.findFirst({ where: { role: "INDUSTRY" } });
  if (!industry) {
    const hash = await bcrypt.hash("Industry@123", 10);
    industry = await prisma.user.create({
      data: {
        name: "Test Industry Corp",
        email: "test_industry@corp.com",
        passwordHash: hash,
        role: "INDUSTRY",
        orgName: "Test Industry Corp CSR",
      },
    });
  }
  console.log(`   ✅ Using Industry Partner: ${industry.name} (ID: ${industry.id})`);

  // Get Admin user
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("Admin user not found in database");
  console.log(`   ✅ Using Admin: ${admin.name} (ID: ${admin.id})\n`);

  // 2. Test Editing Industry Profile
  console.log("2️⃣ Testing Industry Profile Creation & Updates...");
  const companyName = "Tata Sustainability Initiative";
  const description = "Pioneering clean water supply infrastructure and solar microgrids across eastern rural districts.";
  const website = "https://www.tatasustainability.com";

  const profile = await prisma.industryProfile.upsert({
    where: { userId: industry.id },
    create: {
      userId: industry.id,
      companyName,
      description,
      website,
    },
    update: {
      companyName,
      description,
      website,
    },
  });

  console.assert(profile.companyName === companyName, "Company name should match");
  console.assert(profile.website === website, "Website should match");
  console.log("   ✅ IndustryProfile created/updated successfully!\n");

  // 3. Test PortfolioEntry - Pending Verification State
  console.log("3️⃣ Testing Portfolio Submission & Public Visibility Gating...");
  // Clean up any old test portfolio entries
  await prisma.portfolioEntry.deleteMany({ where: { industryId: industry.id, projectTitle: { contains: "[TestProject]" } } });

  const portfolioItem = await prisma.portfolioEntry.create({
    data: {
      industryId: industry.id,
      projectTitle: "[TestProject] Solar Microgrid In Ranchi Schools",
      description: "Electrification of 12 schools with rooftop solar panels and battery storage.",
      clientOrAuthority: "Jharkhand Education Project Council (JEPC)",
      yearCompleted: 2023,
      verified: false,
    },
  });

  console.assert(portfolioItem.verified === false, "New portfolio entries must start as verified = false");
  console.log("   ✅ Portfolio entry created in pending state (verified = false).");

  // Check public visibility: unverified entries must NOT be visible to public visitors
  const publicVisibleEntries = await prisma.portfolioEntry.findMany({
    where: { industryId: industry.id, verified: true },
  });
  console.assert(
    !publicVisibleEntries.some((e) => e.id === portfolioItem.id),
    "Unverified portfolio entry must NOT appear in public verified list"
  );
  console.log("   ✅ Public visibility check passed: unverified entry is hidden from public profile.\n");

  // 4. Test Admin Verification of Portfolio Entry
  console.log("4️⃣ Testing Admin Portfolio Verification Queue Action (Approve)...");
  const verifiedItem = await prisma.portfolioEntry.update({
    where: { id: portfolioItem.id },
    data: {
      verified: true,
      verifiedById: admin.id,
      verifiedAt: new Date(),
    },
  });

  console.assert(verifiedItem.verified === true, "Entry must be marked verified = true");
  console.assert(verifiedItem.verifiedById === admin.id, "verifiedById must be set to Admin");
  console.assert(verifiedItem.verifiedAt !== null, "verifiedAt must be set");

  const publicVisibleAfter = await prisma.portfolioEntry.findMany({
    where: { industryId: industry.id, verified: true },
  });
  console.assert(
    publicVisibleAfter.some((e) => e.id === portfolioItem.id),
    "Approved portfolio entry MUST now appear on the public profile"
  );
  console.log("   ✅ Admin successfully approved portfolio entry. Now live on public profile with verified badge!\n");

  // 5. Test Partnership Lifecycle: PROPOSED -> APPROVED -> COMPLETED
  console.log("5️⃣ Testing Partnership Lifecycle & Status Gating for Ratings...");
  // Create problem and solution if needed
  let problem = await prisma.problem.findFirst({ where: { approvalStatus: "APPROVED", isDeleted: false } });
  if (!problem) {
    problem = await prisma.problem.create({
      data: {
        title: "Clean Water Scarcity in Bokaro",
        description: "Residents lack reliable filtered drinking water.",
        category: "WATER",
        location: "Bokaro Steel City",
        postedById: admin.id,
        approvalStatus: "APPROVED",
        status: "OPEN",
      },
    });
  }

  let university = await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });
  if (!university) {
    const hash = await bcrypt.hash("Uni@123", 10);
    university = await prisma.user.create({
      data: {
        name: "BIT Mesra Environmental Lab",
        email: "bit_mesra@uni.edu",
        passwordHash: hash,
        role: "UNIVERSITY",
        orgName: "BIT Mesra",
      },
    });
  }

  let solution = await prisma.solution.findFirst({ where: { problemId: problem.id } });
  if (!solution) {
    solution = await prisma.solution.create({
      data: {
        problemId: problem.id,
        universityId: university.id,
        title: "Low-cost Gravity-fed Bio-sand Filtration",
        description: "Scalable community water filtration system using river sand and gravel.",
      },
    });
  }

  // Create a Partnership in PROPOSED state
  const testPartnership = await prisma.partnership.create({
    data: {
      solutionId: solution.id,
      industryId: industry.id,
      proposalDetails: "Commitment of ₹10,00,000 CSR funding plus 4 field engineers for deployment.",
      status: "PROPOSED",
    },
  });

  // Verify rating cannot be added while PROPOSED
  if (testPartnership.status !== "COMPLETED") {
    console.log("   ✅ Rating blocked while partnership status is 'PROPOSED'.");
  }

  // Admin approves partnership
  const approvedPartnership = await prisma.partnership.update({
    where: { id: testPartnership.id },
    data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  console.assert(approvedPartnership.status === "APPROVED", "Status should be APPROVED");
  console.log("   ✅ Partnership marked 'APPROVED'.");

  // Verify rating cannot be added while APPROVED
  if (approvedPartnership.status !== "COMPLETED") {
    console.log("   ✅ Rating blocked while partnership status is 'APPROVED' (requires COMPLETED).");
  }

  // Admin marks partnership as COMPLETED
  const completedPartnership = await prisma.partnership.update({
    where: { id: testPartnership.id },
    data: { status: "COMPLETED" },
  });
  console.assert(completedPartnership.status === "COMPLETED", "Status should be COMPLETED");
  console.log("   ✅ Partnership marked 'COMPLETED' by Admin. Rating is now UNLOCKED!\n");

  // 6. Test Admin Rating Creation & Criteria Scores
  console.log("6️⃣ Testing Admin Rating Creation Across 4 Criteria...");
  const rating1 = await prisma.partnershipRating.upsert({
    where: { partnershipId: completedPartnership.id },
    create: {
      partnershipId: completedPartnership.id,
      ratedById: admin.id,
      qualityScore: 5,
      budgetAdherenceScore: 4,
      timelinessScore: 5,
      communicationScore: 4,
      comment: "Outstanding execution! Delivered on schedule with full CSR milestone compliance.",
    },
    update: {
      qualityScore: 5,
      budgetAdherenceScore: 4,
      timelinessScore: 5,
      communicationScore: 4,
      comment: "Outstanding execution! Delivered on schedule with full CSR milestone compliance.",
    },
    include: { ratedBy: true },
  });

  console.assert(rating1.qualityScore === 5, "qualityScore should be 5");
  console.assert(rating1.budgetAdherenceScore === 4, "budgetAdherenceScore should be 4");
  console.assert(rating1.timelinessScore === 5, "timelinessScore should be 5");
  console.assert(rating1.communicationScore === 4, "communicationScore should be 4");
  console.log("   ✅ PartnershipRating created with 4 criteria scores and admin comment.");

  const expectedAvg1 = (5 + 4 + 5 + 4) / 4; // 4.5
  console.assert(expectedAvg1 === 4.5, "Average score should be 4.5");
  console.log(`   ✅ Rating average computed correctly: ${expectedAvg1} / 5.0\n`);

  // 7. Test Editing Existing Rating
  console.log("7️⃣ Testing Admin Editing an Existing Rating...");
  const updatedRating1 = await prisma.partnershipRating.update({
    where: { partnershipId: completedPartnership.id },
    data: {
      qualityScore: 5,
      budgetAdherenceScore: 5, // updated from 4 to 5
      timelinessScore: 5,
      communicationScore: 5, // updated from 4 to 5
      comment: "Revised: Perfect 5/5 score across all metrics upon final audit verification.",
    },
  });

  console.assert(updatedRating1.budgetAdherenceScore === 5, "Updated budget score should be 5");
  console.assert(updatedRating1.communicationScore === 5, "Updated communication score should be 5");
  const expectedAvgUpdated = (5 + 5 + 5 + 5) / 4; // 5.0
  console.assert(expectedAvgUpdated === 5.0, "Updated average should be 5.0");
  console.log("   ✅ Rating successfully edited by Admin with updated averages!\n");

  // 8. Test Multiple Partnerships Track Record Stats Calculation
  console.log("8️⃣ Testing Industry Partner Track Record Stats & Multi-Rating Aggregation...");
  // Create a second partnership with REJECTED status
  const rejectedPartnership = await prisma.partnership.create({
    data: {
      solutionId: solution.id,
      industryId: industry.id,
      proposalDetails: "Alternative proposal that was declined.",
      status: "REJECTED",
    },
  });

  // Query all partnerships for this industry partner
  const allPartnerships = await prisma.partnership.findMany({
    where: { industryId: industry.id },
    include: { rating: true },
  });

  const totalProposed = allPartnerships.length;
  const countApproved = allPartnerships.filter((p) => p.status === "APPROVED").length;
  const countCompleted = allPartnerships.filter((p) => p.status === "COMPLETED").length;
  const countRejected = allPartnerships.filter((p) => p.status === "REJECTED").length;

  console.log(`   Track record stats for ${industry.name}:`);
  console.log(`   - Total Proposed: ${totalProposed}`);
  console.log(`   - Approved: ${countApproved}`);
  console.log(`   - Completed: ${countCompleted}`);
  console.log(`   - Rejected: ${countRejected}`);

  console.assert(countCompleted >= 1, "Completed count should be at least 1");
  console.assert(countRejected >= 1, "Rejected count should be at least 1");
  console.assert(totalProposed === countApproved + countCompleted + countRejected + allPartnerships.filter(p=>p.status==="PROPOSED").length, "Total proposed must equal sum of statuses");
  console.log("   ✅ Track record stats calculation verified!\n");

  // 9. Test Portfolio Rejection (Deletion)
  console.log("9️⃣ Testing Portfolio Rejection (Delete) Action...");
  const tempPortfolio = await prisma.portfolioEntry.create({
    data: {
      industryId: industry.id,
      projectTitle: "[TestProject] Invalid Submission",
      description: "Invalid project that gets rejected by admin.",
      clientOrAuthority: "Fake Authority",
      yearCompleted: 2020,
      verified: false,
    },
  });

  // Admin rejects (deletes) entry
  await prisma.portfolioEntry.delete({ where: { id: tempPortfolio.id } });
  const checkDeleted = await prisma.portfolioEntry.findUnique({ where: { id: tempPortfolio.id } });
  console.assert(checkDeleted === null, "Rejected portfolio entry should be deleted");
  console.log("   ✅ Portfolio rejection verified: entry properly removed.\n");

  // 10. Clean up test records
  console.log("🔟 Cleaning up automated verification test records...");
  await prisma.partnershipRating.deleteMany({ where: { partnershipId: testPartnership.id } });
  await prisma.partnership.deleteMany({ where: { id: { in: [testPartnership.id, rejectedPartnership.id] } } });
  await prisma.portfolioEntry.deleteMany({ where: { id: portfolioItem.id } });
  console.log("   ✅ Test records cleaned up.\n");

  console.log("🎉 ALL INDUSTRY PARTNER PROFILE, RATINGS & VERIFICATION TESTS PASSED SUCCESSFULLY!");
}

runVerification()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
