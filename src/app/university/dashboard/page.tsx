import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Lightbulb, CheckCircle2, ArrowRight, MapPin, Building2 } from "lucide-react";

export default async function UniversityDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [totalProblems, mySolutionsCount, approvedPartnershipsCount, recentProblems] =
    await Promise.all([
      prisma.problem.count({ where: { status: { in: ["OPEN", "SOLUTION_PROPOSED"] }, approvalStatus: "APPROVED", isDeleted: false } }),
      prisma.solution.count({ where: { universityId: session.userId, problem: { isDeleted: false } } }),
      prisma.partnership.count({
        where: {
          solution: { universityId: session.userId, problem: { isDeleted: false } },
          status: "APPROVED",
        },
      }),
      prisma.problem.findMany({
        where: { status: "OPEN", approvalStatus: "APPROVED", isDeleted: false },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { solutions: true } } },
      }),
    ]);

  return (
    <div className="space-y-8 animate-feed-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <span>🎓</span>
            <span>University Research Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">
            Welcome, {session.name}
          </h1>
          <p className="text-gray-500 mt-1 text-base sm:text-lg">
            Apply academic innovation to solve real societal problems reported by citizens.
          </p>
        </div>

        <Link
          href="/problems"
          className="btn-primary py-3 px-6 text-sm font-bold no-underline"
        >
          <Lightbulb size={18} />
          <span>Browse Open Problems</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
            <MapPin size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{totalProblems}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
            Open Civic Problems
          </div>
        </div>

        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
            <Lightbulb size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{mySolutionsCount}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
            Solutions Submitted
          </div>
        </div>

        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{approvedPartnershipsCount}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
            Approved Partnerships
          </div>
        </div>
      </div>

      {/* Recent Problems needing solutions */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Civic Problems Seeking Solutions</h2>
            <p className="text-xs text-gray-500 mt-0.5">Issues open for technical and scientific methodology</p>
          </div>
          <Link
            href="/problems"
            className="btn-outline text-xs py-1.5 px-3.5 no-underline"
          >
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentProblems.map((problem) => (
            <div
              key={problem.id}
              className="p-5 rounded-2xl border border-gray-200/80 bg-[#FAFAF9] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="badge bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {problem.category.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(problem.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-1 text-base">{problem.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 mb-2 font-medium">
                  <MapPin size={12} className="text-gray-400" />
                  <span>{problem.location}</span>
                </p>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{problem.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/70 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {problem._count.solutions} solution{problem._count.solutions !== 1 ? "s" : ""} proposed
                </span>
                <Link
                  href={`/problems/${problem.id}`}
                  className="btn-primary text-xs py-1.5 px-3.5 no-underline"
                >
                  Propose Solution
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
