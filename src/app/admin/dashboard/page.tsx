import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, AlertTriangle, Lightbulb, Handshake, CheckCircle2, Clock } from "lucide-react";
import AdminDashboardTabs from "./AdminDashboardTabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [
    pendingProblemsCount,
    problemsCount,
    solutionsCount,
    pendingPartnershipsCount,
    approvedPartnershipsCount,
    completedPartnershipsCount,
    pendingPortfolioCount,
    pendingPortfolioEntries,
    verifiedPortfolioEntries,
    partnerships,
    problems,
    solutions,
  ] = await Promise.all([
    prisma.problem.count({ where: { approvalStatus: "PENDING", isDeleted: false } }),
    prisma.problem.count({ where: { isDeleted: false } }),
    prisma.solution.count(),
    prisma.partnership.count({ where: { status: "PROPOSED" } }),
    prisma.partnership.count({ where: { status: "APPROVED" } }),
    prisma.partnership.count({ where: { status: "COMPLETED" } }),
    prisma.portfolioEntry.count({ where: { verified: false } }),
    prisma.portfolioEntry.findMany({
      where: { verified: false },
      orderBy: { createdAt: "desc" },
      include: {
        industry: { select: { id: true, name: true, orgName: true, email: true } },
      },
    }),
    prisma.portfolioEntry.findMany({
      where: { verified: true },
      orderBy: { verifiedAt: "desc" },
      take: 50,
      include: {
        industry: { select: { id: true, name: true, orgName: true } },
        verifiedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.partnership.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        industry: { select: { id: true, name: true, email: true, orgName: true } },
        rating: {
          include: {
            ratedBy: { select: { id: true, name: true } },
          },
        },
        solution: {
          include: {
            university: { select: { id: true, name: true, email: true } },
            problem: { select: { id: true, title: true, location: true } },
          },
        },
      },
    }),
    prisma.problem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { solutions: true } },
      },
    }),
    prisma.solution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        university: { select: { id: true, name: true } },
        problem: { select: { id: true, title: true, location: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1ECDF] text-[#1C1B18] border border-[#CBC3AE] mb-2">
            <ShieldCheck size={14} />
            <span>Platform Administration & Moderation</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#17254A]">
            JanSamadhan Control Center
          </h1>
          <p className="text-[#5E5C54] mt-1 text-sm sm:text-base">
            Review problem submissions, moderate partnership proposals, and oversee platform activity.
          </p>
        </div>
      </div>

      {/* Metrics Row: Saffron for pending, green for approved, neutral for others */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Pending Submissions (Saffron) */}
        <div className="card p-4 sm:p-5 border border-[#D98324]/40 bg-[#FBEBD3]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D98324] text-white flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#98590A] font-semibold uppercase tracking-wider">
                Pending Problems
              </p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#17254A]">
                {pendingProblemsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Total Problems (Neutral) */}
        <div className="card p-4 sm:p-5 border border-[#E5DFD0] bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#17254A] border border-[#E5DFD0] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#5E5C54] font-semibold uppercase tracking-wider">
                Total Problems
              </p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B18]">
                {problemsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Solutions (Neutral) */}
        <div className="card p-4 sm:p-5 border border-[#E5DFD0] bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#17254A] border border-[#E5DFD0] flex items-center justify-center shrink-0">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#5E5C54] font-semibold uppercase tracking-wider">
                Solutions
              </p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B18]">
                {solutionsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Partnerships (Saffron) */}
        <div className="card p-4 sm:p-5 border border-[#D98324]/40 bg-[#FBEBD3]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D98324] text-white flex items-center justify-center shrink-0">
              <Handshake size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#98590A] font-semibold uppercase tracking-wider">
                Pending Deals
              </p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#17254A]">
                {pendingPartnershipsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Approved Deals (Green) */}
        <div className="card p-4 sm:p-5 border border-[#2E7D4F]/40 bg-[#E3F0E7]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D4F] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#2E7D4F] font-semibold uppercase tracking-wider">
                Approved Deals
              </p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#17254A]">
                {approvedPartnershipsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Component */}
      <AdminDashboardTabs
        partnerships={partnerships}
        problems={problems}
        solutions={solutions}
        pendingPortfolioEntries={pendingPortfolioEntries}
        verifiedPortfolioEntries={verifiedPortfolioEntries}
      />
    </div>
  );
}
