import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProblemCard from "@/components/problems/ProblemCard";
import { FileText, Plus, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyProblemsPage() {
  const session = await getSession();
  if (!session) return null;

  const myProblems = await prisma.problem.findMany({
    where: { postedById: session.userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      postedBy: { select: { id: true, name: true } },
      _count: { select: { solutions: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header window bar */}
      <div className="bg-[#FFFFFF] border-2 border-[#171e19] shadow-[6px_6px_0_0_#171e19] rounded-xl overflow-hidden">
        <div className="bg-[#171e19] text-[#faf9f6] px-4 py-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffe17c]"></span>
            <span>MY_SUBMISSIONS.LOG</span>
          </div>
          <span className="text-[#b7c6c2] text-[11px]">STATUS: SYNCED</span>
        </div>

        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              CITIZEN DASHBOARD
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171e19] tracking-tight">
              My Reported Problems
            </h1>
            <p className="text-xs sm:text-sm text-[#525e59] mt-1 font-medium">
              Track civic issues submitted by your account, review moderation status, and monitor university proposals.
            </p>
          </div>
          <Link
            href="/citizen/problems/new"
            className="btn-brutalist-yellow text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-5 inline-flex items-center gap-2 no-underline"
          >
            <Plus size={16} />
            <span>Report New Problem</span>
          </Link>
        </div>
      </div>

      {myProblems.length === 0 ? (
        <div className="bg-[#FFFFFF] border-2 border-[#171e19] shadow-[6px_6px_0_0_#171e19] rounded-xl text-center py-16 px-4 text-[#525e59] space-y-3 font-mono">
          <div className="w-16 h-16 rounded-xl bg-[#faf9f6] border-2 border-[#171e19] flex items-center justify-center mx-auto text-[#171e19] shadow-[3px_3px_0_0_#171e19]">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-[#171e19] text-lg uppercase tracking-wider">No problems reported yet</h3>
          <p className="text-xs text-[#525e59] max-w-sm mx-auto font-sans">
            Witness an unresolved issue in your neighborhood? Submit it to connect directly with researchers and technical teams.
          </p>
          <div className="pt-2">
            <Link href="/citizen/problems/new" className="btn-brutalist-yellow inline-flex text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-5">
              Report a Problem
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProblems.map((p) => (
            <div key={p.id} className="space-y-2">
              <ProblemCard problem={p} href={`/problems/${p.id}`} />
              {p.approvalStatus === "REJECTED" && p.rejectionReason && (
                <div className="bg-[#fee2e2] text-[#b91c1c] text-xs p-3 rounded-lg border-2 border-[#b91c1c] shadow-[3px_3px_0_0_#b91c1c] flex items-start gap-1.5 font-mono">
                  <AlertCircle size={14} className="text-[#b91c1c] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider">Rejection Reason:</span>
                    <span className="font-sans font-medium">{p.rejectionReason}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
