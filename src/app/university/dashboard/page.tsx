import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Lightbulb, CheckCircle2, ArrowRight, MapPin, GraduationCap } from "lucide-react";
import ProblemCard from "@/components/problems/ProblemCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UniversityDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [totalProblems, mySolutionsCount, approvedPartnershipsCount, recentProblems] =
    await Promise.all([
      prisma.problem.count({
        where: {
          status: { in: ["OPEN", "SOLUTION_PROPOSED"] },
          approvalStatus: "APPROVED",
          isDeleted: false,
        },
      }),
      prisma.solution.count({
        where: { universityId: session.userId, problem: { isDeleted: false } },
      }),
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
        include: {
          postedBy: { select: { id: true, name: true } },
          _count: { select: { solutions: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E4E9F5] text-[#17254A] border border-[#17254A]/30 mb-2">
            <GraduationCap size={14} />
            <span>University Research Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#17254A]">
            Welcome, {session.name}
          </h1>
          <p className="text-[#5E5C54] mt-1 text-sm sm:text-base">
            Apply academic innovation to solve real societal problems reported by citizens.
          </p>
        </div>

        <Link
          href="/problems"
          className="btn-primary py-2.5 px-5 text-sm font-semibold no-underline"
        >
          <Lightbulb size={16} />
          <span>Browse Open Problems</span>
        </Link>
      </div>

      {/* Metrics Panel */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD0] p-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD0]">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#17254A] border border-[#E5DFD0] flex items-center justify-center mb-2">
            <MapPin size={18} />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17254A]">
            {totalProblems}
          </div>
          <div className="text-xs font-semibold text-[#5E5C54] uppercase tracking-wider mt-1">
            Open Civic Problems
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#2E7D4F] border border-[#E5DFD0] flex items-center justify-center mb-2">
            <Lightbulb size={18} />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#17254A]">
            {mySolutionsCount}
          </div>
          <div className="text-xs font-semibold text-[#5E5C54] uppercase tracking-wider mt-1">
            Solutions Submitted
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F0] text-[#2E7D4F] border border-[#E5DFD0] flex items-center justify-center mb-2">
            <CheckCircle2 size={18} />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#2E7D4F]">
            {approvedPartnershipsCount}
          </div>
          <div className="text-xs font-semibold text-[#5E5C54] uppercase tracking-wider mt-1">
            Approved Partnerships
          </div>
        </div>
      </div>

      {/* Open Civic Problems */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#17254A]">
              Civic Problems Seeking Solutions
            </h2>
            <p className="text-xs text-[#5E5C54] mt-0.5">
              Issues open for technical and scientific methodology
            </p>
          </div>
          <Link
            href="/problems"
            className="btn-outline text-xs py-1.5 px-3.5 no-underline"
          >
            <span>Browse all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentProblems.length === 0 ? (
          <div className="card text-center py-12 text-[#5E5C54] space-y-2">
            <p className="font-semibold text-[#1C1B18]">No open problems right now.</p>
            <p className="text-xs text-[#5E5C54]">Check back soon as citizens report new issues!</p>
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
