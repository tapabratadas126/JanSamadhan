import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log("🌱 Setting up realistic Industry Partner & Admin ratings demo data...");

  const isha = await prisma.user.findFirst({ where: { email: "IshaKumari@example.in" } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const university = await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });

  if (!isha || !admin || !university) {
    throw new Error("Required demo users not found");
  }

  // 1. Create or update Isha's IndustryProfile
  await prisma.industryProfile.upsert({
    where: { userId: isha.id },
    create: {
      userId: isha.id,
      companyName: "Tata Steel CSR & Sustainability Division",
      description: "Empowering rural and semi-urban communities through sustainable civic infrastructure, clean water access, solar microgrids, and vocational skill ecosystems across Jharkhand and Eastern India.",
      website: "https://www.tatasteel.com/sustainability",
    },
    update: {
      companyName: "Tata Steel CSR & Sustainability Division",
      description: "Empowering rural and semi-urban communities through sustainable civic infrastructure, clean water access, solar microgrids, and vocational skill ecosystems across Jharkhand and Eastern India.",
      website: "https://www.tatasteel.com/sustainability",
    },
  });
  await prisma.user.update({
    where: { id: isha.id },
    data: { orgName: "Tata Steel CSR & Sustainability Division" },
  });

  // 2. Setup Portfolio Entries (both verified and pending)
  await prisma.portfolioEntry.deleteMany({ where: { industryId: isha.id } });

  await prisma.portfolioEntry.createMany({
    data: [
      {
        industryId: isha.id,
        projectTitle: "Solar High-Mast Lighting & Community Microgrids",
        description: "Installation of 45 solar-powered high mast units across 18 peri-urban panchayats, benefiting 60,000+ residents with zero-carbon night lighting and emergency storage.",
        clientOrAuthority: "Ranchi Municipal Corporation (RMC)",
        yearCompleted: 2023,
        verified: true,
        verifiedById: admin.id,
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        industryId: isha.id,
        projectTitle: "Decentralized Gravity Bio-Sand Water Hubs",
        description: "Engineered and funded 12 community water purification points removing iron and arsenic contamination for fluoride-affected rural clusters.",
        clientOrAuthority: "Public Health Engineering Department (PHED), Jharkhand",
        yearCompleted: 2022,
        verified: true,
        verifiedById: admin.id,
        verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        industryId: isha.id,
        projectTitle: "Smart Municipal Waste Segregation & Composting Plant",
        description: "Automated segregation machinery and organic aerobic composting pits processing 15 tons/day of wet organic marketplace refuse.",
        clientOrAuthority: "Jamshedpur Notified Area Committee (JNAC)",
        yearCompleted: 2024,
        verified: false, // In queue for Admin approval!
      },
    ],
  });

  // 3. Setup a Problem and Solution if needed
  let problem = await prisma.problem.findFirst({
    where: { approvalStatus: "APPROVED", isDeleted: false },
  });
  if (!problem) {
    problem = await prisma.problem.create({
      data: {
        title: "Contaminated Well Water Supply in Doranda Ward 14",
        description: "Excess turbidity and heavy metal traces discovered in the community borewell feeding 400 households.",
        category: "WATER",
        location: "Doranda, Ranchi",
        postedById: admin.id,
        approvalStatus: "APPROVED",
        status: "OPEN",
      },
    });
  }

  let solution = await prisma.solution.findFirst({
    where: { problemId: problem.id },
  });
  if (!solution) {
    solution = await prisma.solution.create({
      data: {
        problemId: problem.id,
        universityId: university.id,
        title: "Nano-Membrane Multi-Stage Filtration Unit",
        description: "Low-energy membrane technology capable of filtering 2,000 liters/hour with zero chemical discharge.",
      },
    });
  }

  // 4. Create a Completed Partnership with Rating
  // Clean past partnerships for this solution & industry
  await prisma.partnershipRating.deleteMany({
    where: { partnership: { industryId: isha.id } },
  });
  await prisma.partnership.deleteMany({
    where: { industryId: isha.id },
  });

  const completedPartnership = await prisma.partnership.create({
    data: {
      solutionId: solution.id,
      industryId: isha.id,
      proposalDetails: "Commitment of ₹15,00,000 CSR funding + 3 dedicated civil & environmental engineers for field commissioning.",
      status: "COMPLETED",
      reviewedById: admin.id,
      reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Add rating
  await prisma.partnershipRating.create({
    data: {
      partnershipId: completedPartnership.id,
      ratedById: admin.id,
      qualityScore: 5,
      budgetAdherenceScore: 4,
      timelinessScore: 5,
      communicationScore: 5,
      comment: "Exceptional execution! The engineering team deployed all water filtration units 2 weeks ahead of deadline with exemplary transparency and zero budget overrun.",
    },
  });

  // Create an APPROVED partnership (ready to be marked completed by admin!)
  const approvedPartnership = await prisma.partnership.create({
    data: {
      solutionId: solution.id,
      industryId: isha.id,
      proposalDetails: "Phase 2 expansion: Sponsoring smart IoT water monitoring sensors and remote telemetry.",
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`   - Industry: ${isha.email} (ID: ${isha.id})`);
  console.log(`   - Completed Partnership: ${completedPartnership.id} (Rated)`);
  console.log(`   - Approved Partnership: ${approvedPartnership.id} (Ready for completion)`);
}

seedDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
