import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Building2, Lightbulb, MapPin, Handshake, Calendar } from "lucide-react";
import { StatusPill, CATEGORY_DATA } from "@/components/problems/ProblemCard";
import ProposePartnershipForm from "@/app/industry/solutions/[id]/ProposePartnershipForm";

export default async function PublicSolutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const solution = await prisma.solution.findUnique({
    where: { id },
    include: {
      university: { select: { name: true, email: true } },
      problem: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          location: true,
          postedBy: { select: { name: true } },
        },
      },
      partnerships: {
        include: {
          industry: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!solution) notFound();

  const cat = CATEGORY_DATA[solution.problem.category] || {
    label: solution.problem.category,
    emoji: "📌",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#E0E7FF",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar role={session?.role} userName={session?.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 w-full">
        {/* Solution Header Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="badge bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
              <Building2 size={14} />
              <span>Proposed by {solution.university.name}</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {new Date(solution.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1F2933] leading-tight">
            {solution.title}
          </h1>

          {/* Linked Problem Info Box */}
          <div className="bg-teal-50/50 border border-teal-100/80 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                <span>{cat.emoji}</span>
                <span>Addressing Problem ({cat.label})</span>
              </span>
              <span className="text-xs text-teal-700 flex items-center gap-1 font-medium">
                <MapPin size={12} />
                <span>{solution.problem.location}</span>
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">{solution.problem.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">{solution.problem.description}</p>
            <div className="pt-1.5">
              <Link
                href={`/problems/${solution.problem.id}`}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline no-underline"
              >
                View Problem Details →
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Academic Methodology & Technical Details
            </h3>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {solution.description}
            </p>
          </div>
        </div>

        {/* Grid: Propose Partnership Form + Existing Partnerships */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <ProposePartnershipForm solutionId={solution.id} role={session?.role} />
            </div>
          </div>

          {/* Right Column: Existing Partnerships */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-indigo-600" />
                <span>Industry Partnerships ({solution.partnerships.length})</span>
              </h2>
            </div>

            {solution.partnerships.length === 0 ? (
              <div className="card text-center py-12 text-gray-500 space-y-2">
                <Handshake size={36} className="mx-auto text-gray-300" />
                <p className="text-base font-bold text-gray-800">No partnerships proposed yet for this solution.</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Industry partners can submit CSR funding and engineering resource commitments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solution.partnerships.map((p) => (
                  <div key={p.id} className="card card-hover space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{p.industry.name}</h3>
                        <span className="text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <StatusPill status={p.status} />
                    </div>

                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-[#FAFAF9] p-4 rounded-xl border border-gray-100">
                      {p.proposalDetails}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
