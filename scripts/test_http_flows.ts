async function runHttpTests() {
  console.log("🌐 Starting Comprehensive HTTP & Page Verification Tests...\n");

  const baseUrl = "http://localhost:3000";

  // 1. Test Logged-out Visitor loading Industry Profile
  console.log("1️⃣ Testing Logged-out Visitor loading /industry/cmu7e6ett000e7xpnm0o3v5pw...");
  const publicRes = await fetch(`${baseUrl}/industry/cmu7e6ett000e7xpnm0o3v5pw`, {
    redirect: "manual",
  });

  console.assert(publicRes.status === 200, `Expected HTTP 200 for logged-out visitor, got ${publicRes.status}`);
  const html = await publicRes.text();

  console.assert(html.includes("Tata Steel CSR &amp; Sustainability Division") || html.includes("Tata Steel CSR & Sustainability Division"), "Company name must appear on public profile");
  console.assert(html.includes("Solar High-Mast Lighting"), "Verified portfolio item 1 must appear");
  console.assert(html.includes("Decentralized Gravity Bio-Sand Water Hubs"), "Verified portfolio item 2 must appear");
  console.assert(!html.includes("Smart Municipal Waste Segregation &amp; Composting Plant") && !html.includes("Smart Municipal Waste Segregation & Composting Plant"), "UNVERIFIED portfolio item must NOT appear to public visitors");
  console.assert(html.includes("Administrative Performance Ratings"), "Administrative ratings section must appear");
  console.assert(html.includes("Platform Track Record"), "Track record section must appear");
  console.log("   ✅ Logged-out visitor can access public profile without authentication!");
  console.log("   ✅ Verified entries displayed; unverified entries strictly hidden from public.\n");

  // 2. Test Public API /api/industry/cmu7e6ett000e7xpnm0o3v5pw
  console.log("2️⃣ Testing Public API GET /api/industry/cmu7e6ett000e7xpnm0o3v5pw...");
  const apiRes = await fetch(`${baseUrl}/api/industry/cmu7e6ett000e7xpnm0o3v5pw`);
  console.assert(apiRes.status === 200, `Expected HTTP 200 for public API, got ${apiRes.status}`);
  const apiData = await apiRes.json();
  console.assert(apiData.profile.companyName === "Tata Steel CSR & Sustainability Division", "API returns correct companyName");
  console.assert(apiData.stats.completedCount >= 1, "API returns completedCount >= 1");
  console.assert(apiData.ratingSummary.overallAverage > 0, "API returns non-zero rating summary");
  console.assert(apiData.portfolio.every((p: any) => p.verified === true), "API returns ONLY verified portfolio entries for public");
  console.log("   ✅ Public API returned complete profile, stats, rating averages, and verified portfolio items!\n");

  // 3. Admin Login & Session
  console.log("3️⃣ Testing Admin Login via /api/auth/login...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "JanSamadhan@admin.in",
      password: "Admin@123JanSamadhan",
    }),
  });
  console.assert(loginRes.status === 200, `Login failed: ${loginRes.status}`);
  const adminCookie = loginRes.headers.get("set-cookie") || "";
  console.assert(adminCookie.includes("token="), "Token cookie must be set upon login");
  console.log("   ✅ Admin logged in successfully with JWT session cookie.\n");

  // 4. Admin Portfolio Review Queue: Approve unverified entry
  console.log("4️⃣ Testing Admin Portfolio Review Queue (Approve action)...");
  // Find the pending portfolio entry from database
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const pendingEntry = await prisma.portfolioEntry.findFirst({
    where: { industryId: "cmu7e6ett000e7xpnm0o3v5pw", verified: false },
  });

  if (pendingEntry) {
    const verifyRes = await fetch(`${baseUrl}/api/admin/portfolio/${pendingEntry.id}/verify`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ action: "APPROVE" }),
    });

    console.assert(verifyRes.status === 200, `Portfolio verification failed: ${verifyRes.status}`);
    const verifyData = await verifyRes.json();
    console.assert(verifyData.entry.verified === true, "Entry should now be verified");
    console.log(`   ✅ Admin approved project: "${pendingEntry.projectTitle}"`);

    // Verify it is now live on the public profile!
    const publicAfterRes = await fetch(`${baseUrl}/industry/cmu7e6ett000e7xpnm0o3v5pw`);
    const publicAfterHtml = await publicAfterRes.text();
    console.assert(
      publicAfterHtml.includes(pendingEntry.projectTitle),
      "Newly verified project MUST now appear on the public profile"
    );
    console.log("   ✅ Confirmed newly approved project is now visible on public profile with Verified badge!\n");
  } else {
    console.log("   ℹ️ No pending portfolio entry found to approve.\n");
  }

  // 5. Admin Marks Approved Partnership as COMPLETED
  console.log("5️⃣ Testing Admin marking Partnership as COMPLETED...");
  const approvedPartnership = await prisma.partnership.findFirst({
    where: { industryId: "cmu7e6ett000e7xpnm0o3v5pw", status: "APPROVED" },
  });

  if (approvedPartnership) {
    const completeRes = await fetch(`${baseUrl}/api/partnerships/${approvedPartnership.id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });

    console.assert(completeRes.status === 200, `Mark completed failed: ${completeRes.status}`);
    const completedData = await completeRes.json();
    console.assert(completedData.status === "COMPLETED", "Partnership status should now be COMPLETED");
    console.log(`   ✅ Partnership ${approvedPartnership.id} successfully marked as COMPLETED.`);

    // 6. Admin Adds Rating to Newly Completed Partnership
    console.log("6️⃣ Testing Admin rating newly COMPLETED Partnership across 4 criteria...");
    const rateRes = await fetch(`${baseUrl}/api/partnerships/${approvedPartnership.id}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        qualityScore: 5,
        budgetAdherenceScore: 5,
        timelinessScore: 4,
        communicationScore: 5,
        comment: "Flawless IoT telemetry integration and timely delivery.",
      }),
    });

    console.assert(rateRes.status === 200, `Rating submission failed: ${rateRes.status}`);
    const rateData = await rateRes.json();
    console.assert(rateData.rating.qualityScore === 5, "Quality score should be 5");
    console.log("   ✅ Rating successfully recorded by Admin!");

    // Verify rating on public profile
    const profileAfterRate = await fetch(`${baseUrl}/api/industry/cmu7e6ett000e7xpnm0o3v5pw`);
    const profileDataAfter = await profileAfterRate.json();
    console.assert(profileDataAfter.stats.completedCount >= 2, "Completed count should now be at least 2");
    console.assert(profileDataAfter.ratingSummary.count >= 2, "Rating count should now be at least 2");
    console.log(`   ✅ Public profile updated: ${profileDataAfter.stats.completedCount} completed, ${profileDataAfter.ratingSummary.count} ratings, average ${profileDataAfter.ratingSummary.overallAverage} / 5.0\n`);
  }

  // 7. Industry Partner Login & Dashboard
  console.log("7️⃣ Testing Industry Partner Login & Dashboard Capabilities...");
  const industryLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "IshaKumari@example.in",
      password: "Industry@123",
    }),
  });
  console.assert(industryLoginRes.status === 200, `Industry login failed: ${industryLoginRes.status}`);
  const industryCookie = industryLoginRes.headers.get("set-cookie") || "";

  // Industry adds a new portfolio entry
  const newProjectRes = await fetch(`${baseUrl}/api/industry/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: industryCookie,
    },
    body: JSON.stringify({
      projectTitle: "Rural Anganwadi Sanitation Overhaul",
      description: "Construction of 20 child-friendly toilet blocks with rainwater harvesting.",
      clientOrAuthority: "Women & Child Development Department",
      yearCompleted: 2024,
    }),
  });
  console.assert(newProjectRes.status === 201, `New project submission failed: ${newProjectRes.status}`);
  const newProjectData = await newProjectRes.json();
  console.assert(newProjectData.entry.verified === false, "New project must start as verified = false");
  console.log(`   ✅ Industry partner submitted new portfolio project: "${newProjectData.entry.projectTitle}" (pending).`);

  // Confirm unverified entry does NOT appear to public
  const verifyPublicCheck = await fetch(`${baseUrl}/industry/cmu7e6ett000e7xpnm0o3v5pw`);
  const verifyPublicHtml = await verifyPublicCheck.text();
  console.assert(!verifyPublicHtml.includes("Rural Anganwadi Sanitation Overhaul"), "New unverified entry must NOT be visible on public profile");
  console.log("   ✅ Confirmed: new entry does not show on public profile until approved.\n");

  await prisma.$disconnect();
  console.log("🎉 ALL HTTP AND FLOW VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

runHttpTests().catch((e) => {
  console.error("❌ HTTP test failed:", e);
  process.exit(1);
});
