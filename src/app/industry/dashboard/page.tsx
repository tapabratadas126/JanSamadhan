import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Handshake, ArrowRight, Eye, Building2 } from "lucide-react";
import IndustryProfileClient from "./IndustryProfileClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function IndustryDashboard() {
  const session = await getSession();
  if (!session || session.role !== "INDUSTRY") {
    redirect("/login");
  }

  const [
    user,
    profile,
    partnerships,
    portfolioEntries,
    recentSolutions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, orgName: true, role: true },
    }),
    prisma.industryProfile.findUnique({
      where: { userId: session.userId },
    }),
    prisma.partnership.findMany({
      where: { industryId: session.userId },
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
      where: { industryId: session.userId },
      orderBy: { yearCompleted: "desc" },
    }),
    prisma.solution.findMany({
      where: {
        problem: { approvalStatus: "APPROVED", isDeleted: false },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        university: { select: { name: true } },
        problem: { select: { id: true, title: true, category: true, location: true } },
        _count: { select: { partnerships: true } },
      },
    }),
  ]);

  // Compute track record stats
  const totalProposed = partnerships.length;
  const approvedCount = partnerships.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = partnerships.filter((p) => p.status === "REJECTED").length;
  const completedCount = partnerships.filter((p) => p.status === "COMPLETED").length;

  // Extract ratings
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

  const initialProfile = {
    companyName: profile?.companyName || user?.orgName || user?.name || "",
    description: profile?.description || "",
    website: profile?.website || "",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FBEBD3] text-[#98590A] border border-[#D98324]/30 mb-2">
            <Building2 size={14} />
            <span>Industry & CSR Management Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#17254A]">
            Welcome, {session.name}
          </h1>
          <p className="text-[#5E5C54] mt-1 text-sm sm:text-base">
            Manage your verified company profile, view administrative ratings, and propose CSR partnerships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/industry/${session.userId}`}
            className="btn-outline py-2.5 px-4 text-xs font-semibold no-underline flex items-center gap-1.5"
          >
            <Eye size={15} />
            <span>Public Profile Page</span>
          </Link>
          <Link
            href="/solutions"
            className="btn-primary py-2.5 px-5 text-xs font-semibold no-underline flex items-center gap-1.5"
          >
            <Handshake size={15} />
            <span>Explore Solutions</span>
          </Link>
        </div>
      </div>

      {/* Profile, Stats, and Portfolio Tabs Component */}
      <IndustryProfileClient
        userId={session.userId}
        initialProfile={initialProfile}
        initialPortfolio={portfolioEntries}
        stats={{
          totalProposed,
          approvedCount,
          rejectedCount,
          completedCount,
        }}
        ratings={ratings}
        ratingSummary={{
          count: ratingCount,
          overallAverage,
          breakdown: {
            quality: avgQuality,
            budgetAdherence: avgBudget,
            timeliness: avgTimeliness,
            communication: avgCommunication,
          },
        }}
      />

      {/* Recent Solutions ready for partnership */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#17254A]">
              Academic Solutions Ready for CSR Partnership
            </h2>
            <p className="text-xs text-[#5E5C54] mt-0.5">
              Sponsor verified community interventions with measurable impact
            </p>
          </div>
          <Link
            href="/solutions"
            className="btn-outline text-xs py-1.5 px-3.5 no-underline flex items-center gap-1 font-semibold"
          >
            <span>Browse all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentSolutions.map((sol) => (
            <div
              key={sol.id}
              className="p-5 rounded-2xl border border-[#E5DFD0] bg-[#FAF7F0] hover:bg-[#FFFFFF] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="badge bg-[#E4E9F5] text-[#17254A] border-[#17254A]/20">
                    {sol.university.name}
                  </span>
                  <span className="text-xs text-[#5E5C54]">
                    {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-[#1C1B18] line-clamp-1 mb-1">
                  {sol.title}
                </h3>
                <div className="text-xs text-[#5E5C54] mb-3">
                  Problem: {sol.problem.title} ({sol.problem.location})
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between">
                <span className="text-xs text-[#5E5C54]">
                  {sol._count.partnerships} partnerships offered
                </span>
                <Link
                  href={`/solutions/${sol.id}`}
                  className="btn-primary text-xs py-1.5 px-3 no-underline"
                >
                  Propose Partnership
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
