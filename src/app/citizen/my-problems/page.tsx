import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProblemCard from "@/components/problems/ProblemCard";
import { FileText, Plus, AlertCircle } from "lucide-react";

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
    <div className="space-y-6 animate-feed-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">My Reported Problems</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track civic issues submitted by your account, review approval status, and view proposed solutions.
          </p>
        </div>
        <Link
          href="/citizen/problems/new"
          className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2 no-underline"
        >
          <Plus size={16} />
          <span>Report New Problem</span>
        </Link>
      </div>

      {myProblems.length === 0 ? (
        <div className="card text-center py-16 text-gray-500 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No problems reported yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            See an issue in your neighborhood? Report it to get solutions from university research labs.
          </p>
          <div className="pt-2">
            <Link href="/citizen/problems/new" className="btn-primary inline-flex text-sm py-2.5 px-5">
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
                <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200 flex items-start gap-1.5 font-medium">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Rejection Reason:</span>
                    <span>{p.rejectionReason}</span>
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
