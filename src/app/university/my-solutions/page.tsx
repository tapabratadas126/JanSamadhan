import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Lightbulb, MapPin, Handshake, ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/problems/ProblemCard";

export default async function MySolutionsPage() {
  const session = await getSession();
  if (!session) return null;

  const solutions = await prisma.solution.findMany({
    where: { universityId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          status: true,
        },
      },
      partnerships: {
        include: {
          industry: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6 animate-feed-enter">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">My Proposed Solutions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track the status of academic solutions proposed by your institution and review corporate partnerships.
        </p>
      </div>

      {solutions.length === 0 ? (
        <div className="card text-center py-16 text-gray-500 space-y-3">
          <Lightbulb className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No solutions proposed yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Browse civic problems posted by citizens and submit academic research solutions.
          </p>
          <div className="pt-2">
            <Link href="/problems" className="btn-primary inline-flex text-sm py-2.5 px-5">
              Browse Problems
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {solutions.map((sol) => (
            <div
              key={sol.id}
              className="card space-y-4"
            >
              {/* Linked Problem Header */}
              <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                    Linked Civic Problem ({sol.problem.category.replace("_", " ")})
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5">
                    {sol.problem.title}
                  </h3>
                  <span className="text-xs text-teal-700 flex items-center gap-1 mt-1 font-medium">
                    <MapPin size={12} />
                    <span>{sol.problem.location}</span>
                  </span>
                </div>
                <Link
                  href={`/problems/${sol.problem.id}`}
                  className="btn-outline text-xs py-1.5 px-3 bg-white hover:bg-gray-50 shrink-0 flex items-center gap-1 font-semibold"
                >
                  <span>View Problem</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {/* Solution Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-lg">{sol.title}</h2>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {sol.description}
                </p>
              </div>

              {/* Attached Partnerships */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Handshake size={14} className="text-indigo-600" />
                    <span>Industry Partnership Proposals ({sol.partnerships.length})</span>
                  </h4>
                </div>

                {sol.partnerships.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    No industry partners have proposed a partnership on this solution yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sol.partnerships.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#FAFAF9] p-4 rounded-xl border border-gray-200/70 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{p.industry.name}</span>
                          <StatusPill status={p.status} />
                        </div>
                        <p className="text-gray-600 line-clamp-3 leading-relaxed">{p.proposalDetails}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
