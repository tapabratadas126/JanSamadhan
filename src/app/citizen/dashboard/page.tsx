import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText, ThumbsUp, Lightbulb, ArrowRight, User } from "lucide-react";
import ProblemCard from "@/components/problems/ProblemCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CitizenDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [myProblems, recentProblems] = await Promise.all([
    prisma.problem.findMany({
      where: { postedById: session.userId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        postedBy: { select: { id: true, name: true } },
        _count: { select: { solutions: true } },
      },
    }),
    prisma.problem.findMany({
      where: { approvalStatus: "APPROVED", isDeleted: false },
      orderBy: { upvoteCount: "desc" },
      take: 6,
      include: {
        postedBy: { select: { id: true, name: true } },
        _count: { select: { solutions: true } },
      },
    }),
  ]);

  const totalUpvotes = myProblems.reduce((a, p) => a + p.upvoteCount, 0);
  const totalSolutions = myProblems.reduce((a, p) => a + (p._count?.solutions || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-3 border-[#171e19] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] mb-2">
            <User size={13} />
            <span>Citizen Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#171e19] tracking-tight">
            Welcome, {session.name.split(" ")[0]}!
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#171e19]/70 mt-1 uppercase font-bold">
            Report community issues · Monitor academic solutions · Transparent resolution
          </p>
        </div>

        <Link
          href="/citizen/problems/new"
          className="btn-brutalist-yellow text-sm font-extrabold py-3 px-6 no-underline flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Report a Problem</span>
        </Link>
      </div>

      {/* Neo-Brutalist Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border-3 border-[#171e19] bg-white p-6 shadow-[6px_6px_0_0_#171e19]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#171e19] bg-[#ffe17c] px-2 py-0.5 border border-[#171e19]">
              My Reports
            </span>
            <div className="w-10 h-10 border-2 border-[#171e19] bg-white text-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-[#171e19] font-mono">
            {myProblems.length}
          </div>
          <p className="font-mono text-xs text-[#171e19]/60 mt-1">Grievances logged by you</p>
        </div>

        <div className="border-3 border-[#171e19] bg-[#ffe17c] p-6 shadow-[6px_6px_0_0_#171e19]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#171e19] bg-white px-2 py-0.5 border border-[#171e19]">
              Upvotes Received
            </span>
            <div className="w-10 h-10 border-2 border-[#171e19] bg-white text-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center">
              <ThumbsUp size={18} />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-[#171e19] font-mono">
            {totalUpvotes}
          </div>
          <p className="font-mono text-xs text-[#171e19]/70 mt-1">Community endorsements</p>
        </div>

        <div className="border-3 border-[#171e19] bg-[#b7c6c2] p-6 shadow-[6px_6px_0_0_#171e19]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#171e19] bg-white px-2 py-0.5 border border-[#171e19]">
              Academic Solutions
            </span>
            <div className="w-10 h-10 border-2 border-[#171e19] bg-white text-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-center">
              <Lightbulb size={18} />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-[#171e19] font-mono">
            {totalSolutions}
          </div>
          <p className="font-mono text-xs text-[#171e19]/70 mt-1">Research proposals linked</p>
        </div>
      </div>

      {/* Notice an Issue? Boxed Callout */}
      <div className="border-3 border-[#171e19] bg-[#171e19] text-white p-6 sm:p-8 shadow-[8px_8px_0_0_#ffe17c]">
        <div className="max-w-2xl space-y-3">
          <div className="inline-block border border-white bg-[#ff6b6b] text-white font-mono text-[11px] font-bold uppercase px-2 py-0.5">
            Civic Alert
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#ffe17c]">
            Notice an issue in your neighborhood?
          </h2>
          <p className="font-mono text-xs sm:text-sm text-gray-200 leading-relaxed">
            Report civic challenges like road hazards, water quality issues, sanitation, or accessibility barriers in 3 verified steps.
          </p>
          <div className="pt-2">
            <Link
              href="/citizen/problems/new"
              className="inline-flex items-center gap-2 bg-[#ffe17c] text-[#171e19] font-mono font-bold uppercase px-5 py-3 border-2 border-white shadow-[4px_4px_0_0_#ffffff] hover:bg-white transition-all no-underline text-sm"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Report New Problem</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Community Priority Problems */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b-2 border-[#171e19] pb-3">
          <div>
            <h2 className="text-2xl font-black uppercase text-[#171e19] tracking-tight">
              Community Priority Problems
            </h2>
            <p className="font-mono text-xs text-[#171e19]/70 uppercase">Most upvoted civic issues in the area</p>
          </div>
          <Link
            href="/problems"
            className="font-mono text-xs font-bold uppercase px-3 py-1.5 border-2 border-[#171e19] bg-white text-[#171e19] shadow-[2px_2px_0_0_#171e19] hover:bg-[#ffe17c] transition-all no-underline flex items-center gap-1"
          >
            <span>Browse all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentProblems.length === 0 ? (
          <div className="border-3 border-[#171e19] bg-white p-12 text-center shadow-[6px_6px_0_0_#171e19] space-y-2">
            <p className="font-mono font-bold text-base text-[#171e19] uppercase">No problems reported yet.</p>
            <p className="font-mono text-xs text-[#171e19]/60">Be the first citizen to report a community problem!</p>
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
