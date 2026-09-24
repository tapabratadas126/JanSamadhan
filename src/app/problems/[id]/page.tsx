import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Calendar, User, Lightbulb, Handshake, Clock, Sparkles } from "lucide-react";
import UpvoteButton from "@/components/problems/UpvoteButton";
import { StatusPill, CATEGORY_DATA } from "@/components/problems/ProblemCard";
import EditProblemForm from "@/app/citizen/problems/[id]/EditProblemForm";
import ProposeSolutionForm from "@/app/university/problems/[id]/ProposeSolutionForm";
import ProblemCommentsSection from "@/components/problems/ProblemCommentsSection";
import DeleteProblemButton from "@/components/problems/DeleteProblemButton";

export default async function PublicProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const [problem, upvoteStatus] = await Promise.all([
    prisma.problem.findUnique({
      where: { id },
      include: {
        postedBy: { select: { id: true, name: true } },
        solutions: {
          include: {
            university: { select: { id: true, name: true } },
            partnerships: {
              include: {
                industry: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        editHistory: {
          include: { editedBy: { select: { id: true, name: true } } },
          orderBy: { editedAt: "desc" },
        },
      },
    }),
    session
      ? prisma.upvote.findUnique({
          where: { problemId_userId: { problemId: id, userId: session.userId } },
        })
      : null,
  ]);

  if (!problem || problem.isDeleted) notFound();

  // Approval gate access check: non-approved problems are only visible to author and admins
  const isApproved = problem.approvalStatus === "APPROVED";
  const isAuthor = session?.userId === problem.postedById;
  const isAdmin = session?.role === "ADMIN";

  if (!isApproved && !isAuthor && !isAdmin) {
    notFound();
  }

  let mediaUrls: string[] = [];
  try {
    mediaUrls = JSON.parse(problem.mediaUrls || "[]");
  } catch (e) {
    mediaUrls = [];
  }

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  const cat = CATEGORY_DATA[problem.category] || {
    label: problem.category,
    emoji: "📌",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#E0E7FF",
  };

  const canEdit = isAuthor || isAdmin;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar role={session?.role} userName={session?.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 w-full">
        {/* Non-approved Problem Alert Banner */}
        {!isApproved && (
          <div
            className={`p-5 rounded-2xl border text-sm space-y-1 shadow-sm ${
              problem.approvalStatus === "PENDING"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : problem.approvalStatus === "UNDER_REVIEW"
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="font-bold flex items-center gap-2 text-base">
              <span>
                {problem.approvalStatus === "PENDING"
                  ? "⏳ Submission Pending Admin Approval"
                  : problem.approvalStatus === "UNDER_REVIEW"
                  ? "🔍 Submission Under Review"
                  : "❌ Submission Rejected"}
              </span>
            </div>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
              {problem.approvalStatus === "PENDING" &&
                "This problem submission is currently pending review by a platform administrator. It is only visible to you and administrators until approved."}
              {problem.approvalStatus === "UNDER_REVIEW" &&
                "This problem submission is currently under review, it has been forwarded to the relevant authorities."}
              {problem.approvalStatus === "REJECTED" && (
                <>
                  This submission was rejected and will not be published publicly.
                  {problem.rejectionReason && (
                    <span className="block font-semibold mt-1">
                      Reason: {problem.rejectionReason}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Problem Header Card */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: cat.bgColor,
                  color: cat.color,
                  borderColor: cat.borderColor,
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </span>

              <StatusPill status={problem.status} />
            </div>

            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Calendar size={13} />
              <span>{formatDate(problem.createdAt)}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1F2933] leading-tight">
            {problem.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 bg-[#FAFAF9] p-3.5 rounded-xl border border-gray-100 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-gray-400" />
              <span>{problem.location}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User size={15} className="text-gray-400" />
              <span>Reported by {problem.postedBy.name}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Problem Description</h3>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line font-normal">
              {problem.description}
            </p>
          </div>

          {/* Evidence Photos */}
          {mediaUrls.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Evidence Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {mediaUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Problem photo ${i + 1}`}
                    className="w-full h-40 object-cover rounded-2xl border border-gray-200/80 shadow-sm hover:scale-[1.02] transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-3.5 flex-wrap">
            {isApproved && !isAdmin && (
              <UpvoteButton
                problemId={problem.id}
                initialCount={problem.upvoteCount}
                initialUpvoted={!!upvoteStatus}
              />
            )}

            {canEdit && <EditProblemForm problem={problem} />}
            {isAuthor && <DeleteProblemButton problemId={problem.id} />}
          </div>
        </div>

        {/* Grid: Propose Solution Form + Existing Solutions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Propose Solution Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <ProposeSolutionForm problemId={problem.id} role={session?.role} />
            </div>
          </div>

          {/* Solutions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-500" />
                <span>Proposed Academic Solutions ({problem.solutions.length})</span>
              </h2>
            </div>

            {problem.solutions.length === 0 ? (
              <div className="card text-center py-12 text-gray-500 space-y-2">
                <Lightbulb size={36} className="mx-auto text-gray-300" />
                <p className="text-base font-bold text-gray-800">No solutions proposed yet.</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  University research labs and faculties can submit technical proposals to solve this issue.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {problem.solutions.map((sol) => (
                  <div key={sol.id} className="card card-hover space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="badge bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {sol.university.name}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg mt-1.5">{sol.title}</h3>
                      </div>
                      <Link
                        href={`/solutions/${sol.id}`}
                        className="btn-outline text-xs py-1.5 px-3 shrink-0 no-underline"
                      >
                        View Details →
                      </Link>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{sol.description}</p>

                    {/* Partnerships on this solution */}
                    {sol.partnerships.length > 0 && (
                      <div className="bg-[#FAFAF9] rounded-xl p-4 space-y-2.5 border border-gray-100">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Handshake size={14} className="text-emerald-600" />
                          <span>Industry Partnerships ({sol.partnerships.length})</span>
                        </p>
                        {sol.partnerships.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white rounded-xl p-3.5 border border-gray-200/80 text-xs space-y-1.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-gray-800">{p.industry.name}</span>
                              <StatusPill status={p.status} />
                            </div>
                            <p className="text-gray-600 line-clamp-2 leading-relaxed">{p.proposalDetails}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Discussion Forum (Strictly gated to APPROVED problems) */}
        <ProblemCommentsSection
          problemId={problem.id}
          approvalStatus={problem.approvalStatus}
          currentUserId={session?.userId}
          currentUserRole={session?.role}
        />

        {/* Edit History Log */}
        {problem.editHistory.length > 0 && (
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              <span>Edit History ({problem.editHistory.length})</span>
            </h2>
            <div className="space-y-3">
              {problem.editHistory.map((entry) => (
                <div key={entry.id} className="border-l-2 border-indigo-200 pl-4 py-1 text-xs">
                  <div className="flex items-center gap-2 text-gray-500 mb-1.5 font-medium">
                    <span className="font-bold text-gray-800">{entry.editedBy.name}</span>
                    <span>updated</span>
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-semibold">
                      {entry.fieldName}
                    </span>
                    <span className="ml-auto text-gray-400">{formatDate(entry.editedAt)}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-red-500 font-bold">−</span>
                      <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 line-clamp-2">
                        {entry.oldValue}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-500 font-bold">+</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 line-clamp-2">
                        {entry.newValue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

