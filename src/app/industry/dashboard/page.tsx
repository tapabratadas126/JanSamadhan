import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Building2, Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function IndustryDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [totalSolutions, myPartnershipsCount, approvedCount, recentSolutions] =
    await Promise.all([
      prisma.solution.count(),
      prisma.partnership.count({ where: { industryId: session.userId } }),
      prisma.partnership.count({
        where: { industryId: session.userId, status: "APPROVED" },
      }),
      prisma.solution.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          university: { select: { name: true } },
          problem: { select: { id: true, title: true, category: true, location: true } },
          _count: { select: { partnerships: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-8 animate-feed-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <span>🏭</span>
            <span>Industry & CSR Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">
            Welcome, {session.name}
          </h1>
          <p className="text-gray-500 mt-1 text-base sm:text-lg">
            Partner with top academic institutions to fund, resource, and scale civic solutions for local communities.
          </p>
        </div>

        <Link
          href="/solutions"
          className="btn-primary py-3 px-6 text-sm font-bold no-underline"
        >
          <Handshake size={18} />
          <span>Explore Academic Solutions</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
            <Lightbulb size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{totalSolutions}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
            Available Solutions
          </div>
        </div>

        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
            <Handshake size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{myPartnershipsCount}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
            Partnerships Proposed
          </div>
        </div>

        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{approvedCount}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
            Approved Partnerships
          </div>
        </div>
      </div>

      {/* Recent Solutions ready for partnership */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Academic Solutions Ready for CSR Partnership</h2>
            <p className="text-xs text-gray-500 mt-0.5">Sponsor verified community interventions with measurable impact</p>
          </div>
          <Link
            href="/solutions"
            className="btn-outline text-xs py-1.5 px-3.5 no-underline"
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
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{sol.description}</p>
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
