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
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E3F0E7] text-[#2E7D4F] border border-[#2E7D4F]/30 mb-2">
            <User size={13} />
            <span>Citizen Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#17254A]">
            Welcome, {session.name.split(" ")[0]}!
          </h1>
          <p className="text-[#5E5C54] mt-1 text-sm sm:text-base">
            Report community issues, monitor academic solutions, and track transparent resolution.
          </p>
        </div>

        <Link
          href="/citizen/problems/new"
          className="btn-primary py-2.5 px-5 text-sm font-semibold no-underline"
        >
          <Plus size={16} />
          <span>Report a Problem</span>
        </Link>
      </div>

      {/* One Unified Metrics Panel with Dividers (instead of 3 separate tinted cards) */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD0] p-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD0]">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#17254A] flex items-center justify-center mb-2 border border-[#E5DFD0]">
            <FileText size={18} />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17254A]">
            {myProblems.length}
          </div>
          <div className="text-xs font-semibold text-[#5E5C54] uppercase tracking-wider mt-1">
            My Reports
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#2E7D4F] flex items-center justify-center mb-2 border border-[#E5DFD0]">
            <ThumbsUp size={18} />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17254A]">
            {totalUpvotes}
          </div>
          <div className="text-xs font-semibold text-[#5E5C54] uppercase tracking-wider mt-1">
            Upvotes Received
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#D98324] flex items-center justify-center mb-2 border border-[#E5DFD0]">
            <Lightbulb size={18} />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17254A]">
            {totalSolutions}
          </div>
          <div className="text-xs font-semibold text-[#5E5C54] uppercase tracking-wider mt-1">
            Academic Solutions
          </div>
        </div>
      </div>

      {/* Notice an Issue? Panel (Flat Navy #17254A, no gradients) */}
      <div className="rounded-2xl bg-[#17254A] text-white p-6 sm:p-8 border border-[#17254A]">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white">
            Notice an issue in your neighborhood?
          </h2>
          <p className="text-xs sm:text-sm text-[#E4E9F5]/90 leading-relaxed">
            Report civic challenges like road hazards, water quality issues, sanitation, or accessibility barriers in 3 verified steps.
          </p>
          <div className="pt-2">
            <Link
              href="/citizen/problems/new"
              className="inline-flex items-center gap-2 bg-[#2E7D4F] text-white font-semibold px-5 py-2.5 rounded-[10px] hover:bg-[#22633D] transition-colors no-underline text-sm"
            >
              <Plus size={16} />
              <span>Report New Problem</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Community Priority Problems */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#17254A]">
              Community Priority Problems
            </h2>
            <p className="text-xs text-[#5E5C54]">Most upvoted issues across communities</p>
          </div>
          <Link href="/problems" className="btn-outline text-xs py-1.5 px-3.5 no-underline">
            <span>Browse all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentProblems.length === 0 ? (
          <div className="card text-center py-12 text-[#5E5C54] space-y-2">
            <p className="font-semibold text-[#1C1B18]">No problems reported yet.</p>
            <p className="text-xs text-[#5E5C54]">Be the first citizen to report a community problem!</p>
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
