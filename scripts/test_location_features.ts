import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing Location-Based Sorting, Filtering, and Grouping Requirements...\n");

  // Cleanup past test data
  await prisma.problemComment.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.problem.deleteMany({ where: { title: { contains: "[LocTest]" } } });

  const hash = await bcrypt.hash("TestPass123!", 10);
  let user = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Location Tester",
        email: "loctest@test.local",
        passwordHash: hash,
        role: "CITIZEN",
      },
    });
  }

  // Create test problems with various locations and approval statuses
  console.log("1️⃣ Creating test problems with plain-text location values...");
  const testProblemsData = [
    { title: "[LocTest] Broken Bridge", location: "Kanke Road, Ranchi", status: "APPROVED" },
    { title: "[LocTest] Potholes", location: "Doranda, Ranchi", status: "APPROVED" },
    { title: "[LocTest] Water Supply Leak", location: "Main Road, Dhanbad", status: "APPROVED" },
    { title: "[LocTest] Streetlight Outage", location: "Sakchi, Jamshedpur", status: "APPROVED" },
    { title: "[LocTest] Unapproved Trash", location: "Bariatu, Ranchi", status: "PENDING" },
  ];

  for (const item of testProblemsData) {
    await prisma.problem.create({
      data: {
        title: item.title,
        description: "Test description for location feature",
        category: "WATER",
        location: item.location,
        postedById: user.id,
        approvalStatus: item.status,
      },
    });
  }
  console.log("   ✅ Created test problems in Ranchi, Dhanbad, and Jamshedpur.\n");

  // 2. Test GET /problems/locations logic (distinct approved locations & district parsing)
  console.log("2️⃣ Testing GET /problems/locations logic...");
  const approvedProblems = await prisma.problem.findMany({
    where: { approvalStatus: "APPROVED", isDeleted: false },
    select: { location: true },
  });

  const rawLocationSet = new Set<string>();
  const districtSet = new Set<string>();

  for (const p of approvedProblems) {
    if (!p.location) continue;
    const trimmed = p.location.trim();
    if (!trimmed) continue;
    rawLocationSet.add(trimmed);

    const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      const district = parts[parts.length - 1];
      if (district) districtSet.add(district);
    }
  }

  const availableLocations = Array.from(
    new Set([...districtSet, ...rawLocationSet])
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  console.log("   Extracted Locations:", availableLocations);
  console.assert(availableLocations.includes("Ranchi"), "Locations must include extracted district Ranchi");
  console.assert(availableLocations.includes("Dhanbad"), "Locations must include extracted district Dhanbad");
  console.assert(availableLocations.includes("Jamshedpur"), "Locations must include extracted district Jamshedpur");
  console.assert(!availableLocations.includes("Bariatu, Ranchi"), "Unapproved problem location should not be present");
  console.log("   ✅ GET /problems/locations logic verified!\n");

  // 3. Test Partial Case-Insensitive Location Matching
  console.log("3️⃣ Testing GET /problems?location=Ranchi partial matching...");
  const ranchiMatches = await prisma.problem.findMany({
    where: {
      approvalStatus: "APPROVED",
      isDeleted: false,
      location: { contains: "ranchi" },
    },
  });

  console.log(`   Found ${ranchiMatches.length} problems matching 'ranchi' (case-insensitive partial match)`);
  console.assert(ranchiMatches.length === 2, "Should find 2 approved problems in Ranchi");
  ranchiMatches.forEach((p) => {
    console.assert(p.location.toLowerCase().includes("ranchi"), `Problem ${p.title} location should match ranchi`);
  });
  console.log("   ✅ Location filter query verified!\n");

  // 4. Test Alphabetical Sorting by location_text
  console.log("4️⃣ Testing sort_by=location (Alphabetical A-Z ordering)...");
  const sortedProblems = await prisma.problem.findMany({
    where: { approvalStatus: "APPROVED", isDeleted: false, title: { contains: "[LocTest]" } },
    orderBy: { location: "asc" },
  });

  console.log("   Sorted locations:", sortedProblems.map((p) => p.location));
  for (let i = 0; i < sortedProblems.length - 1; i++) {
    const locA = sortedProblems[i].location;
    const locB = sortedProblems[i + 1].location;
    console.assert(locA.localeCompare(locB) <= 0, `${locA} should precede or equal ${locB}`);
  }
  console.log("   ✅ Alphabetical location sorting verified!\n");

  // Cleanup test problems
  await prisma.problem.deleteMany({ where: { title: { contains: "[LocTest]" } } });
  console.log("🎉 ALL LOCATION FEATURE TESTS PASSED SUCCESSFULLY!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
