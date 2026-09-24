import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText, ThumbsUp, Lightbulb, ArrowRight } from "lucide-react";
import ProblemCard from "@/components/problems/ProblemCard";

export default async function CitizenDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [myProblems, recentProblems] = await Promise.all([
    prisma.problem.findMany({
      where: { postedById: session.userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        postedBy: { select: { id: true, name: true } },
        _count: { select: { solutions: true } },
      },
    }),
    prisma.problem.findMany({
      where: { approvalStatus: "APPROVED" },
      orderBy: { upvoteCount: "desc" },
      take: 6,
      include: {
        postedBy: { select: { id: true, name: true } },
        _count: { select: { solutions: true } },
      },
    }),
  ]);

  const totalUpvotes = myProblems.reduce((a, p) => a + p.upvoteCount, 0);

  return (
    <div className="space-y-8 animate-feed-enter">
      {/* Welcome header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
            <span>🧑</span>
            <span>Citizen Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">
            Welcome, {session.name.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1 text-base sm:text-lg">
            Report community issues, monitor academic solutions, and track resolution.
          </p>
        </div>

        <Link
          href="/citizen/problems/new"
          className="btn-primary py-3 px-6 text-sm font-bold no-underline"
        >
          <Plus size={18} />
          <span>Report a Problem</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
            <FileText size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{myProblems.length}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">My Reports</div>
        </div>

        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
            <ThumbsUp size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{totalUpvotes}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Upvotes Received</div>
        </div>

        <div className="card text-center p-6 bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
            <Lightbulb size={20} />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">
            {myProblems.reduce((a, p) => a + (p._count?.solutions || 0), 0)}
          </div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Academic Solutions</div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 p-8 text-white shadow-lg shadow-indigo-500/20">
        <div className="max-w-xl space-y-3">
          <h2 className="text-2xl font-extrabold text-white">Notice an issue in your neighborhood?</h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            Report civic challenges like road hazards, water quality issues, sanitation, or accessibility barriers in 3 easy steps.
          </p>
          <div className="pt-2">
            <Link
              href="/citizen/problems/new"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors no-underline text-sm shadow-md"
            >
              <Plus size={18} />
              <span>Report New Problem</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Most Upvoted Problems */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Community Priority Problems</h2>
            <p className="text-xs text-gray-500">Most upvoted issues across communities</p>
          </div>
          <Link href="/problems" className="btn-outline text-xs py-1.5 px-3.5 no-underline">
            <span>Browse all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentProblems.length === 0 ? (
          <div className="card text-center py-12 text-gray-500 space-y-2">
            <div className="text-4xl mb-2">🏘️</div>
            <p className="font-bold text-gray-800">No problems reported yet.</p>
            <p className="text-xs text-gray-400">Be the first citizen to report a community problem!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProblems.map((p) => (
              <ProblemCard key={p.id} problem={p} href={`/problems/${p.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
