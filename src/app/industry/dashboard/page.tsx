import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Handshake, ArrowRight, Eye } from "lucide-react";
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
    <div className="space-y-8 animate-feed-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <span>🏭</span>
            <span>Industry & CSR Management Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">
            Welcome, {session.name}
          </h1>
          <p className="text-gray-500 mt-1 text-base sm:text-lg">
            Manage your verified company profile, view administrative ratings, and propose CSR partnerships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/industry/${session.userId}`}
            className="btn-outline py-2.5 px-4 text-xs font-bold no-underline flex items-center gap-1.5"
          >
            <Eye size={15} />
            <span>Public Profile Page</span>
          </Link>
          <Link
            href="/solutions"
            className="btn-primary py-2.5 px-5 text-xs font-bold no-underline flex items-center gap-1.5"
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
            <h2 className="text-xl font-bold text-gray-900">
              Academic Solutions Ready for CSR Partnership
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
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
              className="p-5 rounded-2xl border border-gray-200/80 bg-[#FAFAF9] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="badge bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {sol.university.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{sol.title}</h3>
                <p className="text-xs text-gray-500 mt-1 mb-2 font-medium">
                  Addressing: <span className="font-semibold text-gray-700">{sol.problem.title}</span> ({sol.problem.location})
                </p>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {sol.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {sol._count.partnerships} partnerships proposed
                </span>
                <Link
                  href={`/solutions/${sol.id}`}
                  className="btn-primary text-xs py-1.5 px-3.5 no-underline"
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
