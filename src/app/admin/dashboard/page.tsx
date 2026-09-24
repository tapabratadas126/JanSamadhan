import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, AlertTriangle, Lightbulb, Handshake, CheckCircle2, Clock } from "lucide-react";
import AdminDashboardTabs from "./AdminDashboardTabs";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [
    pendingProblemsCount,
    problemsCount,
    solutionsCount,
    pendingPartnershipsCount,
    approvedPartnershipsCount,
    partnerships,
    problems,
    solutions,
  ] = await Promise.all([
    prisma.problem.count({ where: { approvalStatus: "PENDING" } }),
    prisma.problem.count(),
    prisma.solution.count(),
    prisma.partnership.count({ where: { status: "PROPOSED" } }),
    prisma.partnership.count({ where: { status: "APPROVED" } }),
    prisma.partnership.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        industry: { select: { name: true, email: true } },
        solution: {
          include: {
            university: { select: { name: true, email: true } },
            problem: { select: { id: true, title: true, location: true } },
          },
        },
      },
    }),
    prisma.problem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: { select: { name: true, email: true, phone: true } },
        _count: { select: { solutions: true } },
      },
    }),
    prisma.solution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        university: { select: { name: true } },
        problem: { select: { title: true, location: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8 animate-feed-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <span>🛡️</span>
            <span>Platform Administration & Moderation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">
            JanSamadhan Control Center
          </h1>
          <p className="text-gray-500 mt-1 text-base sm:text-lg">
            Review problem submissions, moderate partnership proposals, and oversee platform activity.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-5 border border-amber-200 shadow-sm bg-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">Pending Submissions</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-950">{pendingProblemsCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Problems</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{problemsCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Lightbulb size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Academic Solutions</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{solutionsCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 border border-purple-200/70 shadow-sm bg-purple-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Handshake size={20} />
            </div>
            <div>
              <p className="text-xs text-purple-800 font-bold uppercase tracking-wider">Pending Deals</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-950">{pendingPartnershipsCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 border border-emerald-200/70 shadow-sm bg-emerald-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Approved Deals</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{approvedPartnershipsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Component */}
      <AdminDashboardTabs
        partnerships={partnerships}
        problems={problems}
        solutions={solutions}
      />
    </div>
  );
}
