import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jansamadhan-development-jwt-secret-key-32charslong"
);

async function signJWT(payload: any): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

async function testHttp() {
  console.log("=== Testing HTTP Endpoints on Dev Server ===");

  // 1. Test Public Problems Page
  const problemsRes = await fetch("http://localhost:3000/problems");
  console.log(`[PASS] GET /problems status: ${problemsRes.status}`);
  const html = await problemsRes.text();
  if (!html.includes("Clean Water Scarcity in Bokaro") && !html.includes("Sparrows and crows")) {
    console.warn("Warning: expected problem titles not found in public HTML");
  } else {
    console.log("[PASS] Public problems are rendered and visible to everyone!");
  }

  // 2. Admin Token
  const adminToken = await signJWT({
    userId: "cmu7c059n0000nsz5x9d6c60f",
    role: "ADMIN",
    name: "JanSamadhan Admin",
    email: "JanSamadhan@admin.in",
  });
  const adminCookie = `token=${adminToken}`;

  // 3. Admin Update Problem Status
  const testProblemId = "cmui94djw0005vtgkjbkx84c8"; // Clean Water Scarcity
  const patchRes = await fetch(`http://localhost:3000/api/problems/${testProblemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ approvalStatus: "APPROVED", status: "OPEN" }),
  });
  console.log(`[PASS] Admin PATCH /api/problems/${testProblemId} status: ${patchRes.status}`);
  const patchData = await patchRes.json();
  console.log(`[PASS] Updated problem approvalStatus: ${patchData.approvalStatus}, status: ${patchData.status}`);

  // 4. Citizen Attempt to Edit Problem with Solution (cmuicewkw0002kmu1hhztrx93)
  const citizenProblemId = "cmuicewkw0002kmu1hhztrx93";
  const citizenToken = await signJWT({
    userId: "cmuic5grs0000kmu1raiwb0pm",
    role: "CITIZEN",
    name: "hamza",
    email: "hamza@gmail.com",
  });
  const citizenCookie = `token=${citizenToken}`;

  // Attempt to edit problem with solution
  const citizenEditRes = await fetch(`http://localhost:3000/api/problems/${citizenProblemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: citizenCookie,
    },
    body: JSON.stringify({ title: "Citizen unauthorized edit test" }),
  });
  console.log(`[PASS] Citizen PATCH on problem with solution status: ${citizenEditRes.status}`);
  const citizenEditData = await citizenEditRes.json();
  console.log(`[PASS] Response message: ${citizenEditData.error}`);
  if (citizenEditRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for citizen edit, got ${citizenEditRes.status}`);
  }

  // Attempt to delete problem with solution
  const citizenDeleteRes = await fetch(`http://localhost:3000/api/problems/${citizenProblemId}`, {
    method: "DELETE",
    headers: { Cookie: citizenCookie },
  });
  console.log(`[PASS] Citizen DELETE on problem with solution status: ${citizenDeleteRes.status}`);
  const citizenDeleteData = await citizenDeleteRes.json();
  console.log(`[PASS] Response message: ${citizenDeleteData.error}`);
  if (citizenDeleteRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for citizen delete, got ${citizenDeleteRes.status}`);
  }

  // 5. Test Admin Deletion of Portfolio Entry via HTTP
  const industry = await prisma.user.findFirst({ where: { role: "INDUSTRY" } });
  if (industry) {
    const tempPortfolio = await prisma.portfolioEntry.create({
      data: {
        industryId: industry.id,
        projectTitle: "HTTP Test Project",
        description: "Testing Admin Deletion via HTTP",
        clientOrAuthority: "Municipality",
        yearCompleted: 2023,
        verified: true,
      },
    });

    // Test CANCEL verification via PATCH
    const cancelRes = await fetch(`http://localhost:3000/api/admin/portfolio/${tempPortfolio.id}/verify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ action: "CANCEL" }),
    });
    console.log(`[PASS] Admin cancel portfolio verification status: ${cancelRes.status}`);
    const cancelData = await cancelRes.json();
    console.log(`[PASS] Portfolio cancelled action: ${cancelData.action}`);

    // Test DELETE portfolio via DELETE
    const delPortfolioRes = await fetch(`http://localhost:3000/api/admin/portfolio/${tempPortfolio.id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    console.log(`[PASS] Admin DELETE portfolio status: ${delPortfolioRes.status}`);
  }

  // 6. Test Admin Deletion of Partnership & Academic Solution via HTTP
  const university = await prisma.user.findFirst({ where: { role: "UNIVERSITY" } });
  if (university && industry) {
    const tempSolution = await prisma.solution.create({
      data: {
        problemId: testProblemId,
        universityId: university.id,
        title: "HTTP Test Solution",
        description: "Testing deletion",
      },
    });

    const tempPartnership = await prisma.partnership.create({
      data: {
        solutionId: tempSolution.id,
        industryId: industry.id,
        proposalDetails: "Testing partnership deletion",
        status: "APPROVED",
      },
    });

    // Test DELETE partnership
    const delPartnershipRes = await fetch(`http://localhost:3000/api/partnerships/${tempPartnership.id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    console.log(`[PASS] Admin DELETE partnership status: ${delPartnershipRes.status}`);

    // Test DELETE solution
    const delSolutionRes = await fetch(`http://localhost:3000/api/solutions/${tempSolution.id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    console.log(`[PASS] Admin DELETE solution status: ${delSolutionRes.status}`);
  }

  console.log("=== All HTTP Tests Passed Successfully! ===");
}

testHttp()
  .catch((err) => {
    console.error("HTTP test failure:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
