import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getSession();

    // Check user exists and is role INDUSTRY
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        orgName: true,
        createdAt: true,
      },
    });

    if (!user || user.role !== "INDUSTRY") {
      return NextResponse.json({ error: "Industry Partner not found" }, { status: 404 });
    }

    const isOwnerOrAdmin = session && (session.userId === userId || session.role === "ADMIN");

    // Fetch profile, partnerships, ratings, and portfolio
    const [profile, partnerships, portfolioEntries] = await Promise.all([
      prisma.industryProfile.findUnique({
        where: { userId },
      }),
      prisma.partnership.findMany({
        where: { industryId: userId },
        include: {
          solution: {
            include: {
              problem: { select: { id: true, title: true, location: true } },
              university: { select: { id: true, name: true } },
            },
          },
          rating: {
            include: {
              ratedBy: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.portfolioEntry.findMany({
        where: {
          industryId: userId,
          ...(isOwnerOrAdmin ? {} : { verified: true }),
        },
        orderBy: { yearCompleted: "desc" },
      }),
    ]);

    // Compute track record stats
    const totalProposed = partnerships.length;
    const approvedCount = partnerships.filter((p) => p.status === "APPROVED").length;
    const rejectedCount = partnerships.filter((p) => p.status === "REJECTED").length;
    const completedCount = partnerships.filter((p) => p.status === "COMPLETED").length;

    // Extract ratings from completed partnerships
    const ratings = partnerships
      .filter((p) => p.rating !== null)
      .map((p) => ({
        id: p.rating!.id,
        partnershipId: p.id,
        problemId: p.solution.problem.id,
        problemTitle: p.solution.problem.title,
        problemLocation: p.solution.problem.location,
        solutionTitle: p.solution.title,
        universityName: p.solution.university.name,
        ratedBy: p.rating!.ratedBy.name,
        qualityScore: p.rating!.qualityScore,
        budgetAdherenceScore: p.rating!.budgetAdherenceScore,
        timelinessScore: p.rating!.timelinessScore,
        communicationScore: p.rating!.communicationScore,
        overallScore: Number(
          (
            (p.rating!.qualityScore +
              p.rating!.budgetAdherenceScore +
              p.rating!.timelinessScore +
              p.rating!.communicationScore) /
            4
          ).toFixed(1)
        ),
        comment: p.rating!.comment,
        createdAt: p.rating!.createdAt,
      }));

    // Compute averages
    const ratingCount = ratings.length;
    let avgQuality = 0;
    let avgBudget = 0;
    let avgTimeliness = 0;
    let avgCommunication = 0;
    let overallAverage = 0;

    if (ratingCount > 0) {
      const sumQuality = ratings.reduce((acc, r) => acc + r.qualityScore, 0);
      const sumBudget = ratings.reduce((acc, r) => acc + r.budgetAdherenceScore, 0);
      const sumTimeliness = ratings.reduce((acc, r) => acc + r.timelinessScore, 0);
      const sumCommunication = ratings.reduce((acc, r) => acc + r.communicationScore, 0);

      avgQuality = Number((sumQuality / ratingCount).toFixed(1));
      avgBudget = Number((sumBudget / ratingCount).toFixed(1));
      avgTimeliness = Number((sumTimeliness / ratingCount).toFixed(1));
      avgCommunication = Number((sumCommunication / ratingCount).toFixed(1));
      overallAverage = Number(
        ((avgQuality + avgBudget + avgTimeliness + avgCommunication) / 4).toFixed(1)
      );
    }

    return NextResponse.json({
      user,
      profile: profile || {
        companyName: user.orgName || user.name,
        description: "Civic-minded industry partner committed to sustainable community development.",
        website: null,
      },
      stats: {
        totalProposed,
        approvedCount,
        rejectedCount,
        completedCount,
      },
      ratingSummary: {
        count: ratingCount,
        overallAverage,
        breakdown: {
          quality: avgQuality,
          budgetAdherence: avgBudget,
          timeliness: avgTimeliness,
          communication: avgCommunication,
        },
      },
      ratings,
      portfolio: portfolioEntries,
    });
  } catch (error) {
    console.error("Public industry profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
