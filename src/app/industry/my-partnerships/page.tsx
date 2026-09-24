import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Building2, MapPin, ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/problems/ProblemCard";

export default async function MyPartnershipsPage() {
  const session = await getSession();
  if (!session) return null;

  const partnerships = await prisma.partnership.findMany({
    where: { industryId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      solution: {
        include: {
          university: { select: { name: true } },
          problem: {
            select: {
              id: true,
              title: true,
              category: true,
              location: true,
            },
          },
        },
      },
      reviewedBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6 animate-feed-enter">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">My Proposed Partnerships</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track review status, administration approvals, and commitments made by your corporate entity.
        </p>
      </div>

      {partnerships.length === 0 ? (
        <div className="card text-center py-16 text-gray-500 space-y-3">
          <Handshake className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No partnerships proposed yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Browse solutions proposed by university research labs and offer CSR funding or technical partnerships.
          </p>
          <div className="pt-2">
            <Link
              href="/solutions"
              className="btn-primary inline-flex text-sm py-2.5 px-5"
            >
              Browse Solutions
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {partnerships.map((p) => (
            <div
              key={p.id}
              className="card space-y-4"
            >
              {/* Solution & University Header */}
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Academic Solution by {p.solution.university.name}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-0.5">{p.solution.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Problem: <span className="font-semibold text-gray-700">{p.solution.problem.title}</span> (
                    {p.solution.problem.location})
                  </p>
                </div>
                <Link
                  href={`/solutions/${p.solution.id}`}
                  className="btn-outline text-xs py-1.5 px-3 bg-white hover:bg-gray-50 shrink-0 flex items-center gap-1 font-semibold"
                >
                  <span>View Solution</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {/* Proposal Content & Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">Review Status:</span>
                    <StatusPill status={p.status} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    Submitted on{" "}
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="bg-[#FAFAF9] p-4 rounded-xl border border-gray-100 space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commitment Details</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {p.proposalDetails}
                  </p>
                </div>

                {p.reviewedBy && (
                  <p className="text-xs text-gray-500 italic">
                    Reviewed by Admin ({p.reviewedBy.name}) on{" "}
                    {p.reviewedAt &&
                      new Date(p.reviewedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
