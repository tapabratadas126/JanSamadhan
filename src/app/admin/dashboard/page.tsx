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
      {/* Header Window Bar */}
      <div className="bg-[#FFFFFF] border-2 border-[#171e19] shadow-[6px_6px_0_0_#171e19] rounded-xl overflow-hidden">
        <div className="bg-[#171e19] text-[#faf9f6] px-4 py-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffe17c]"></span>
            <span>SYSTEM_KERNEL: ROOT_ADMIN_CONTROL</span>
          </div>
          <span className="text-[#b7c6c2] text-[11px]">SECURITY_LEVEL: 0</span>
        </div>

        <div className="p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} />
              <span>Platform Administration & Moderation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#171e19] tracking-tight">
              JanSamadhan Control Center
            </h1>
            <p className="text-[#525e59] mt-1 text-sm sm:text-base font-medium">
              Review citizen problem submissions, moderate partnership proposals, and oversee platform activity.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row: 5 Neo-brutalist metric boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Pending Submissions (Yellow Highlight) */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border-2 border-[#171e19] shadow-[5px_5px_0_0_#171e19] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[#525e59] font-mono font-bold uppercase tracking-wider">
                Pending Queue
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-[#171e19]">
                {pendingProblemsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Total Problems */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border-2 border-[#171e19] shadow-[5px_5px_0_0_#171e19] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#faf9f6] text-[#171e19] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[#525e59] font-mono font-bold uppercase tracking-wider">
                Total Problems
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-[#171e19]">
                {problemsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Solutions */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border-2 border-[#171e19] shadow-[5px_5px_0_0_#171e19] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#b7c6c2] text-[#171e19] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center shrink-0">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[#525e59] font-mono font-bold uppercase tracking-wider">
                Solutions
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-[#171e19]">
                {solutionsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Partnerships */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border-2 border-[#171e19] shadow-[5px_5px_0_0_#171e19] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center shrink-0">
              <Handshake size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[#525e59] font-mono font-bold uppercase tracking-wider">
                Pending Deals
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-[#171e19]">
                {pendingPartnershipsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Approved Deals */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border-2 border-[#171e19] shadow-[5px_5px_0_0_#171e19] transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#171e19] text-[#ffe17c] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[#525e59] font-mono font-bold uppercase tracking-wider">
                Approved Deals
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-[#171e19]">
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
