import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Calendar,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import StarRating, { CriteriaScoreBar } from "@/components/industry/StarRating";

interface IndustryProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function IndustryProfilePage({ params }: IndustryProfilePageProps) {
  const { userId } = await params;
  const session = await getSession();

  // Find user and confirm role INDUSTRY
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      orgName: true,
      createdAt: true,
    },
  });

  if (!user || user.role !== "INDUSTRY") {
    notFound();
  }

  const isOwner = session?.userId === user.id;
  const isAdmin = session?.role === "ADMIN";
  const canSeePending = isOwner || isAdmin;

  // Fetch profile, partnerships and portfolio entries
  const [profile, partnerships, portfolioEntries] = await Promise.all([
    prisma.industryProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.partnership.findMany({
      where: { industryId: user.id },
      include: {
        solution: {
          include: {
            problem: { select: { id: true, title: true, location: true } },
            university: { select: { id: true, name: true } },
          },
        },
        rating: {
          include: {
            ratedBy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.portfolioEntry.findMany({
      where: {
        industryId: user.id,
        ...(canSeePending ? {} : { verified: true }),
      },
      include: {
        verifiedBy: { select: { id: true, name: true } },
      },
      orderBy: { yearCompleted: "desc" },
    }),
  ]);

  // Compute track record stats
  const totalProposed = partnerships.length;
  const approvedCount = partnerships.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = partnerships.filter((p) => p.status === "REJECTED").length;
  const completedCount = partnerships.filter((p) => p.status === "COMPLETED").length;

  // Extract ratings
  const ratings = partnerships
    .filter((p) => p.rating !== null)
    .map((p) => ({
      id: p.rating!.id,
      partnershipId: p.id,
      problemId: p.solution.problem.id,
      problemTitle: p.solution.problem.title,
      problemLocation: p.solution.problem.location,
      solutionTitle: p.solution.title,
      universityName: p.solution.university.name,
      ratedBy: p.rating!.ratedBy.name,
      qualityScore: p.rating!.qualityScore,
      budgetAdherenceScore: p.rating!.budgetAdherenceScore,
      timelinessScore: p.rating!.timelinessScore,
      communicationScore: p.rating!.communicationScore,
      overallScore: Number(
        (
          (p.rating!.qualityScore +
            p.rating!.budgetAdherenceScore +
            p.rating!.timelinessScore +
            p.rating!.communicationScore) /
          4
        ).toFixed(1)
      ),
      comment: p.rating!.comment,
      createdAt: p.rating!.createdAt,
    }));

  const ratingCount = ratings.length;
  let avgQuality = 0;
  let avgBudget = 0;
  let avgTimeliness = 0;
  let avgCommunication = 0;
  let overallAverage = 0;

  if (ratingCount > 0) {
    const sumQuality = ratings.reduce((acc, r) => acc + r.qualityScore, 0);
    const sumBudget = ratings.reduce((acc, r) => acc + r.budgetAdherenceScore, 0);
    const sumTimeliness = ratings.reduce((acc, r) => acc + r.timelinessScore, 0);
    const sumCommunication = ratings.reduce((acc, r) => acc + r.communicationScore, 0);

    avgQuality = Number((sumQuality / ratingCount).toFixed(1));
    avgBudget = Number((sumBudget / ratingCount).toFixed(1));
    avgTimeliness = Number((sumTimeliness / ratingCount).toFixed(1));
    avgCommunication = Number((sumCommunication / ratingCount).toFixed(1));
    overallAverage = Number(
      ((avgQuality + avgBudget + avgTimeliness + avgCommunication) / 4).toFixed(1)
    );
  }

  const companyName = profile?.companyName || user.orgName || user.name;
  const description =
    profile?.description ||
    "Civic-minded industry partner committed to sustainable community development through verified public-private partnerships.";
  const website = profile?.website;

  return (
    <div className="space-y-8 animate-feed-enter max-w-5xl mx-auto pb-12">
      {/* Top Banner & Profile Overview */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-100/50 via-indigo-50/40 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Logo / Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 font-extrabold text-2xl tracking-tight">
              <Building2 size={36} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {companyName}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <span>🏭</span>
                  <span>Industry Partner</span>
                </span>
                {completedCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Verified Contributor</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-0.5">
                <span>
                  Representative: <strong className="text-gray-700">{user.name}</strong>
                </span>
                <span>•</span>
                <span>
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {website && (
                  <>
                    <span>•</span>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold no-underline transition-colors"
                    >
                      <Globe size={13} />
                      <span>{website.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink size={11} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons if owner */}
          {isOwner && (
            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/industry/dashboard"
                className="btn-outline text-xs py-2 px-4 w-full sm:w-auto justify-center font-bold no-underline"
              >
                <span>Edit Profile / Portfolio</span>
              </Link>
            </div>
          )}
        </div>

        {/* Company Description */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Company Overview
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>

      {/* Track Record Stats Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <span>📊</span>
          <span>Platform Track Record</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Proposals
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Handshake size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{totalProposed}</div>
            <p className="text-[11px] text-gray-400 mt-1">Submitted partnerships</p>
          </div>

          <div className="card p-5 bg-emerald-50/40 border border-emerald-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Approved
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-950">{approvedCount}</div>
            <p className="text-[11px] text-emerald-700/80 mt-1">Accepted proposals</p>
          </div>

          <div className="card p-5 bg-purple-50/40 border border-purple-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Completed
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-purple-950">{completedCount}</div>
            <p className="text-[11px] text-purple-700/80 mt-1">Finished implementations</p>
          </div>

          <div className="card p-5 bg-rose-50/40 border border-rose-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Rejected
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-950">{rejectedCount}</div>
            <p className="text-[11px] text-rose-700/80 mt-1">Declined proposals</p>
          </div>
        </div>
      </div>

      {/* Ratings & Evaluation Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span>⭐</span>
              <span>Administrative Performance Ratings</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified scores assigned by platform administrators upon completion of partnerships
            </p>
          </div>
        </div>

        {/* Overall Rating & Criteria Summary */}
        <div className="card p-6 bg-white border border-gray-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Column: Big Overall Score */}
          <div className="text-center md:border-r border-gray-100 md:pr-6 py-2 flex flex-col items-center justify-center space-y-2">
            <div className="text-5xl font-black text-gray-900 tracking-tight">
              {overallAverage > 0 ? overallAverage.toFixed(1) : "—"}
            </div>
            <StarRating score={overallAverage} size={22} showText={false} />
            <div className="text-xs text-gray-500 font-medium">
              {ratingCount > 0 ? (
                <span>
                  Based on <strong>{ratingCount}</strong> verified completion{" "}
                  {ratingCount === 1 ? "review" : "reviews"}
                </span>
              ) : (
                <span className="italic">No completed partnership ratings yet</span>
              )}
            </div>
          </div>

          {/* Right Columns: Criteria Breakdown */}
          <div className="md:col-span-2 space-y-3.5">
            <CriteriaScoreBar
              label="Quality of Deliverables"
              icon="💎"
              score={avgQuality}
            />
            <CriteriaScoreBar
              label="Budget & Resource Adherence"
              icon="💰"
              score={avgBudget}
            />
            <CriteriaScoreBar
              label="Timeliness & Schedule"
              icon="⏱️"
              score={avgTimeliness}
            />
            <CriteriaScoreBar
              label="Communication & Transparency"
              icon="💬"
              score={avgCommunication}
            />
          </div>
        </div>

        {/* Individual Past Ratings List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-800">
            Completed Partnership Reviews ({ratings.length})
          </h3>

          {ratings.length === 0 ? (
            <div className="card text-center py-12 text-gray-500 space-y-2">
              <Clock className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">No ratings published yet</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Ratings are recorded and published here once an approved partnership completes implementation and receives administrative evaluation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <div
                  key={r.id}
                  className="card p-6 space-y-4 border border-gray-200/90 hover:border-gray-300 transition-colors shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StarRating score={r.overallScore} size={16} />
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-medium">
                          Reviewed by Admin (<strong>{r.ratedBy}</strong>) on{" "}
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-base pt-1">
                        Solution: {r.solutionTitle}
                      </h4>

                      <p className="text-xs text-gray-500">
                        Addressing Problem:{" "}
                        <Link
                          href={`/problems/${r.problemId}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors"
                        >
                          {r.problemTitle}
                        </Link>{" "}
                        ({r.problemLocation}) • University:{" "}
                        <span className="font-semibold text-gray-700">{r.universityName}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-xs shrink-0">
                      <div>
                        <span className="text-gray-400">Quality:</span>{" "}
                        <strong className="text-gray-800">{r.qualityScore}/5</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Budget:</span>{" "}
                        <strong className="text-gray-800">{r.budgetAdherenceScore}/5</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Timeliness:</span>{" "}
                        <strong className="text-gray-800">{r.timelinessScore}/5</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Communication:</span>{" "}
                        <strong className="text-gray-800">{r.communicationScore}/5</strong>
                      </div>
                    </div>
                  </div>

                  {r.comment && (
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/80 text-sm text-gray-800 leading-relaxed italic">
                      &ldquo;{r.comment}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verified Portfolio Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span>💼</span>
              <span>Verified Project Portfolio</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Self-reported track record of civic and infrastructure projects, verified by platform administrators
            </p>
          </div>

          {canSeePending && (
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              {isOwner ? "Visible to you and administrators" : "Admin review view"}
            </span>
          )}
        </div>

        {portfolioEntries.length === 0 ? (
          <div className="card text-center py-12 text-gray-500 space-y-2">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-700">No verified portfolio records yet</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              This industry partner has not yet had past public works verified by administrators.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {portfolioEntries.map((item) => (
              <div
                key={item.id}
                className={`card p-6 space-y-3 flex flex-col justify-between border transition-all ${
                  item.verified
                    ? "border-emerald-200/80 bg-white hover:border-emerald-300 shadow-xs"
                    : "border-amber-200 bg-amber-50/20"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="badge bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                      Completed {item.yearCompleted}
                    </span>

                    {item.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>✅ Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock size={13} className="text-amber-600" />
                        <span>Pending Verification</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      {item.projectTitle}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Client / Authority:{" "}
                      <strong className="text-gray-800">{item.clientOrAuthority}</strong>
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {item.verified && item.verifiedAt && (
                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                    Verified on{" "}
                    {new Date(item.verifiedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
