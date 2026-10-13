"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Handshake,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Check,
  Building2,
  MapPin,
  Clock,
  Search,
  Eye,
  AlertCircle,
  Briefcase,
  Star,
  Award,
  ExternalLink,
  MessageSquare,
  Edit3,
  RefreshCw,
} from "lucide-react";
import { StatusPill, ApprovalStatusPill } from "@/components/problems/ProblemCard";
import StarRating from "@/components/industry/StarRating";

interface AdminDashboardTabsProps {
  partnerships: any[];
  problems: any[];
  solutions: any[];
  pendingPortfolioEntries?: any[];
  verifiedPortfolioEntries?: any[];
}

export default function AdminDashboardTabs({
  partnerships,
  problems,
  solutions,
  pendingPortfolioEntries = [],
  verifiedPortfolioEntries = [],
}: AdminDashboardTabsProps) {
  const router = useRouter();

  const pendingProblems = problems.filter(
    (p) => !p.isDeleted && (p.approvalStatus === "PENDING" || p.approvalStatus === "UNDER_REVIEW")
  );

  const pendingPartnerships = partnerships.filter((p) => p.status === "PROPOSED");
  const reviewedPartnerships = partnerships.filter((p) => p.status !== "PROPOSED");

  const [activeTab, setActiveTab] = useState<
    "pending_problems" | "partnerships" | "problems" | "solutions" | "portfolio_review"
  >(
    pendingProblems.length > 0
      ? "pending_problems"
      : pendingPartnerships.length > 0
      ? "partnerships"
      : pendingPortfolioEntries.length > 0
      ? "portfolio_review"
      : "partnerships"
  );

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [problemStatusFilter, setProblemStatusFilter] = useState<string>("ALL");
  const [problemSearch, setProblemSearch] = useState<string>("");

  // Rejection dialog state
  const [rejectingProblemId, setRejectingProblemId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Rating modal state
  const [ratingPartnership, setRatingPartnership] = useState<any | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(5);
  const [budgetAdherenceScore, setBudgetAdherenceScore] = useState<number>(5);
  const [timelinessScore, setTimelinessScore] = useState<number>(5);
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [isSavingRating, setIsSavingRating] = useState<boolean>(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Approve Problem Action
  async function handleApproveProblem(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/problems/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve problem");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error approving problem");
    } finally {
      setProcessingId(null);
    }
  }

  // Under Review Action
  async function handleUnderReviewProblem(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/problems/${id}/under-review`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to update status to under review");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error updating status");
    } finally {
      setProcessingId(null);
    }
  }

  // Reject Problem Action
  async function handleConfirmRejectProblem() {
    if (!rejectingProblemId) return;
    setProcessingId(rejectingProblemId);
    try {
      const res = await fetch(`/api/admin/problems/${rejectingProblemId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (!res.ok) throw new Error("Failed to reject problem");
      setRejectingProblemId(null);
      setRejectionReason("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error rejecting problem");
    } finally {
      setProcessingId(null);
    }
  }

  // Review Partnership Action (APPROVED | REJECTED | COMPLETED)
  async function handleReviewPartnership(
    id: string,
    status: "APPROVED" | "REJECTED" | "COMPLETED"
  ) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/partnerships/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to review partnership");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error reviewing partnership");
    } finally {
      setProcessingId(null);
    }
  }

  // Open Rating Modal
  function handleOpenRatingModal(p: any) {
    setRatingPartnership(p);
    setRatingError(null);
    if (p.rating) {
      setQualityScore(p.rating.qualityScore);
      setBudgetAdherenceScore(p.rating.budgetAdherenceScore);
      setTimelinessScore(p.rating.timelinessScore);
      setCommunicationScore(p.rating.communicationScore);
      setRatingComment(p.rating.comment || "");
    } else {
      setQualityScore(5);
      setBudgetAdherenceScore(5);
      setTimelinessScore(5);
      setCommunicationScore(5);
      setRatingComment("");
    }
  }

  // Submit Rating
  async function handleSaveRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingPartnership) return;
    setIsSavingRating(true);
    setRatingError(null);

    try {
      const res = await fetch(`/api/partnerships/${ratingPartnership.id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qualityScore,
          budgetAdherenceScore,
          timelinessScore,
          communicationScore,
          comment: ratingComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save rating");

      setRatingPartnership(null);
      router.refresh();
    } catch (err: any) {
      setRatingError(err.message || "Error saving rating");
    } finally {
      setIsSavingRating(false);
    }
  }

  // Verify / Reject / Cancel Portfolio Entry
  async function handleVerifyPortfolio(id: string, action: "APPROVE" | "REJECT" | "CANCEL" | "DELETE") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/portfolio/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to process portfolio entry");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error processing portfolio entry");
    } finally {
      setProcessingId(null);
    }
  }

  // Update Problem Resolution Status (e.g. RESOLVED)
  async function handleUpdateProblemStatus(id: string, status: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update problem status");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error updating problem");
    } finally {
      setProcessingId(null);
    }
  }

  // Update Problem Moderation / Approval Status (e.g. APPROVED, UNDER_REVIEW, REJECTED)
  async function handleUpdateProblemApprovalStatus(id: string, approvalStatus: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update problem approval status");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error updating problem");
    } finally {
      setProcessingId(null);
    }
  }

  // Restore Soft-Deleted Problem
  async function handleRestoreProblem(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restore problem");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error restoring problem");
    } finally {
      setProcessingId(null);
    }
  }

  // Delete Problem Action
  async function handleDeleteProblem(id: string) {
    if (!confirm("Are you sure you want to delete this problem?")) {
      return;
    }
    setProcessingId(id);
    try {
      const res = await fetch(`/api/problems/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete problem");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting problem");
    } finally {
      setProcessingId(null);
    }
  }

  // Delete Partnership Action
  async function handleDeletePartnership(id: string) {
    if (!confirm("Are you sure you want to delete this partnership record? This action cannot be undone.")) {
      return;
    }
    setProcessingId(id);
    try {
      const res = await fetch(`/api/partnerships/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete partnership");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting partnership");
    } finally {
      setProcessingId(null);
    }
  }

  // Delete Portfolio Entry Action
  async function handleDeletePortfolio(id: string) {
    if (!confirm("Are you sure you want to delete this portfolio entry?")) {
      return;
    }
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete portfolio entry");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting portfolio entry");
    } finally {
      setProcessingId(null);
    }
  }

  // Delete Proposed Academic Solution Action
  async function handleDeleteSolution(id: string) {
    if (!confirm("Are you sure you want to delete this academic solution and all associated partnership records?")) {
      return;
    }
    setProcessingId(id);
    try {
      const res = await fetch(`/api/solutions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete solution");
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting solution");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredProblems = problems.filter((p) => {
    let matchesStatus = true;
    if (problemStatusFilter === "DELETED") {
      matchesStatus = Boolean(p.isDeleted);
    } else if (problemStatusFilter === "ACTIVE") {
      matchesStatus = !p.isDeleted;
    } else if (problemStatusFilter !== "ALL") {
      matchesStatus = !p.isDeleted && p.approvalStatus === problemStatusFilter;
    }
    const matchesSearch =
      !problemSearch ||
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(problemSearch.toLowerCase()) ||
      (p.postedBy?.name || "").toLowerCase().includes(problemSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("pending_problems")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "pending_problems"
              ? "border-amber-500 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Clock size={17} />
          <span>Approval Queue</span>
          {pendingProblems.length > 0 && (
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {pendingProblems.length} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("partnerships")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "partnerships"
              ? "border-[#6366F1] text-[#6366F1]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Handshake size={17} />
          <span>Partnerships</span>
          {pendingPartnerships.length > 0 && (
            <span className="bg-purple-100 text-purple-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {pendingPartnerships.length} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("portfolio_review")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "portfolio_review"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Briefcase size={17} />
          <span>Portfolio Review</span>
          {pendingPortfolioEntries.length > 0 && (
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {pendingPortfolioEntries.length} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("problems")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "problems"
              ? "border-[#14B8A6] text-[#0D9488]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <AlertTriangle size={17} />
          <span>All Civic Problems ({problems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("solutions")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "solutions"
              ? "border-[#6366F1] text-[#6366F1]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Lightbulb size={17} />
          <span>Academic Solutions ({solutions.length})</span>
        </button>
      </div>

      {/* Tab 0: Pending Problem Submissions Queue */}
      {activeTab === "pending_problems" && (
        <div className="space-y-6 animate-feed-enter">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
            <div>
              <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Citizen Submission Approval Queue ({pendingProblems.length})</span>
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Submissions must be approved by an administrator before appearing live on the public feed.
              </p>
            </div>
          </div>

          {pendingProblems.length === 0 ? (
            <div className="card text-center py-16 text-gray-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-gray-800 text-lg">No pending submissions</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                All citizen problem reports have been reviewed and processed!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {pendingProblems.map((problem) => {
                let mediaUrls: string[] = [];
                try {
                  mediaUrls = JSON.parse(problem.mediaUrls || "[]");
                } catch (e) {
                  mediaUrls = [];
                }

                return (
                  <div
                    key={problem.id}
                    className="card p-6 space-y-4 border-2 border-amber-200/80 shadow-md bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-[280px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ApprovalStatusPill status={problem.approvalStatus} />
                          <span className="badge bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {problem.category.replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400">
                            Submitted {new Date(problem.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-xl leading-snug">
                          {problem.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-gray-400" />
                            <span>{problem.location}</span>
                          </span>
                          <span>•</span>
                          <span>
                            Submitted by:{" "}
                            <strong className="text-gray-800">{problem.postedBy.name}</strong>{" "}
                            {problem.postedBy.email && `(${problem.postedBy.email})`}
                          </span>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => handleApproveProblem(problem.id)}
                          disabled={processingId === problem.id}
                          className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 font-bold shadow-sm"
                        >
                          <Check size={15} />
                          <span>Approve & Publish</span>
                        </button>

                        {problem.approvalStatus !== "UNDER_REVIEW" && (
                          <button
                            onClick={() => handleUnderReviewProblem(problem.id)}
                            disabled={processingId === problem.id}
                            className="btn-outline text-xs py-2 px-3.5 text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5 font-semibold"
                          >
                            <Eye size={15} />
                            <span>Under Review</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setRejectingProblemId(problem.id);
                            setRejectionReason("");
                          }}
                          disabled={processingId === problem.id}
                          className="btn-danger text-xs py-2 px-3.5 flex items-center gap-1.5 font-semibold"
                        >
                          <XCircle size={15} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#FAFAF9] p-4 rounded-xl border border-gray-200/70 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Problem Description
                      </h4>
                      {problem.description}
                    </div>

                    {mediaUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Evidence Photos ({mediaUrls.length})
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {mediaUrls.map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={i}
                              src={url}
                              alt="Evidence"
                              className="h-24 w-32 object-cover rounded-xl border border-gray-200 shadow-sm shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Partnerships Moderation & Completion Ratings */}
      {activeTab === "partnerships" && (
        <div className="space-y-8 animate-feed-enter">
          {/* Pending Reviews Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
              <span>Pending Partnership Approvals ({pendingPartnerships.length})</span>
            </h2>

            {pendingPartnerships.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-gray-800">All caught up!</p>
                <p className="text-xs text-gray-400">
                  No pending partnership proposals require administrative review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPartnerships.map((p) => (
                  <div
                    key={p.id}
                    className="card border-2 border-purple-200/80 p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {/* Clickable link to industry partner profile */}
                          <Link
                            href={`/industry/${p.industry.id}`}
                            className="badge bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100 no-underline transition-colors inline-flex items-center gap-1"
                          >
                            <span>{p.industry.name} (Industry)</span>
                            <ExternalLink size={10} />
                          </Link>
                          <span className="text-gray-400 text-xs">proposes partnership with</span>
                          <span className="badge bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                            {p.solution.university.name} (University)
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mt-1">{p.solution.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Problem: <span className="font-semibold text-gray-700">{p.solution.problem.title}</span> (
                          {p.solution.problem.location})
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => handleReviewPartnership(p.id, "APPROVED")}
                          disabled={processingId === p.id}
                          className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>Approve Partnership</span>
                        </button>
                        <button
                          onClick={() => handleReviewPartnership(p.id, "REJECTED")}
                          disabled={processingId === p.id}
                          className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleDeletePartnership(p.id)}
                          disabled={processingId === p.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Partnership Proposal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/80 space-y-1">
                      <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                        Proposal & Resource Commitment
                      </h4>
                      <p className="text-sm text-purple-950 whitespace-pre-line leading-relaxed">
                        {p.proposalDetails}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewed Partnerships & Completion Management */}
          <div className="space-y-4 pt-4 border-t border-gray-200/80">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Active & Completed Partnerships ({reviewedPartnerships.length})
              </h2>
              <p className="text-xs text-gray-500">
                Mark finished partnerships as COMPLETED to unlock administrative performance evaluations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewedPartnerships.map((p) => (
                <div
                  key={p.id}
                  className="card p-5 space-y-3 text-xs border border-gray-200/90 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {/* Clickable link to industry profile */}
                      <Link
                        href={`/industry/${p.industry.id}`}
                        className="font-bold text-gray-900 hover:text-indigo-600 underline flex items-center gap-1 text-sm"
                      >
                        <span>{p.industry.name}</span>
                        <ExternalLink size={11} className="text-gray-400" />
                      </Link>
                      <StatusPill status={p.status} />
                    </div>

                    <p className="font-semibold text-gray-700 line-clamp-1">
                      Solution: {p.solution.title}
                    </p>
                    <p className="text-gray-500 line-clamp-2 leading-relaxed">
                      {p.proposalDetails}
                    </p>

                    {/* Rating display if rated */}
                    {p.rating && (
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/70 space-y-1.5 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <span>⭐</span>
                            <span>Admin Evaluation</span>
                          </span>
                          <StarRating
                            score={
                              (p.rating.qualityScore +
                                p.rating.budgetAdherenceScore +
                                p.rating.timelinessScore +
                                p.rating.communicationScore) /
                              4
                            }
                            size={13}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-gray-600">
                          <div>Quality: <strong>{p.rating.qualityScore}/5</strong></div>
                          <div>Budget: <strong>{p.rating.budgetAdherenceScore}/5</strong></div>
                          <div>Timeliness: <strong>{p.rating.timelinessScore}/5</strong></div>
                          <div>Comms: <strong>{p.rating.communicationScore}/5</strong></div>
                        </div>
                        {p.rating.comment && (
                          <p className="text-[11px] text-gray-700 italic border-t border-amber-100 pt-1">
                            &ldquo;{p.rating.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for Approved and Completed */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
                    {p.status === "APPROVED" && (
                      <button
                        onClick={() => handleReviewPartnership(p.id, "COMPLETED")}
                        disabled={processingId === p.id}
                        className="btn-outline text-xs py-1.5 px-3 border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-1 font-semibold"
                        title="Mark implementation finished to unlock performance rating"
                      >
                        <Award size={13} />
                        <span>Mark as Completed</span>
                      </button>
                    )}

                    {p.status === "COMPLETED" && (
                      <button
                        onClick={() => handleOpenRatingModal(p)}
                        className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700 flex items-center gap-1 font-semibold"
                      >
                        <Star size={13} />
                        <span>{p.rating ? "Edit Rating" : "Add Rating"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeletePartnership(p.id)}
                      disabled={processingId === p.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      title="Delete Partnership Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Portfolio Review Queue */}
      {activeTab === "portfolio_review" && (
        <div className="space-y-6 animate-feed-enter">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80">
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Industry Project Portfolio Verification Queue ({pendingPortfolioEntries.length})</span>
            </h2>
            <p className="text-xs text-emerald-800 mt-0.5">
              Review and verify relevant past projects reported by industry partners. Approved projects display publicly on their partner profile.
            </p>
          </div>

          {pendingPortfolioEntries.length === 0 ? (
            <div className="card text-center py-16 text-gray-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-gray-800 text-lg">No pending portfolio reviews</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                All submitted past project records from industry partners have been reviewed!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPortfolioEntries.map((item) => (
                <div
                  key={item.id}
                  className="card p-6 border-2 border-emerald-200/80 bg-white space-y-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/industry/${item.industry.id}`}
                          className="badge bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100 no-underline transition-colors inline-flex items-center gap-1"
                        >
                          <span>{item.industry.name} (Industry)</span>
                          <ExternalLink size={10} />
                        </Link>
                        <span className="badge bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                          Year {item.yearCompleted}
                        </span>
                        <span className="text-xs text-gray-400">
                          Submitted {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg leading-snug pt-1">
                        {item.projectTitle}
                      </h3>

                      <p className="text-xs text-gray-600 font-medium">
                        Client / Authority:{" "}
                        <strong className="text-gray-800">{item.clientOrAuthority}</strong>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleVerifyPortfolio(item.id, "APPROVE")}
                        disabled={processingId === item.id}
                        className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 font-bold shadow-xs"
                      >
                        <Check size={14} />
                        <span>Approve & Verify</span>
                      </button>
                      <button
                        onClick={() => handleVerifyPortfolio(item.id, "REJECT")}
                        disabled={processingId === item.id}
                        className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5 font-semibold"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Project Description & Community Outcomes
                    </h4>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recently Verified Portfolio Items History */}
          {verifiedPortfolioEntries.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <h3 className="text-base font-bold text-gray-800">
                Recently Verified Portfolio Projects ({verifiedPortfolioEntries.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verifiedPortfolioEntries.map((v) => (
                  <div key={v.id} className="card p-4 space-y-1.5 text-xs bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/industry/${v.industry.id}`}
                        className="font-bold text-gray-900 hover:underline flex items-center gap-1"
                      >
                        <span>{v.industry.name}</span>
                        <ExternalLink size={10} />
                      </Link>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={11} />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800">{v.projectTitle}</p>
                    <p className="text-gray-500">Client: {v.clientOrAuthority} ({v.yearCompleted})</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleVerifyPortfolio(v.id, "CANCEL")}
                        disabled={processingId === v.id}
                        className="btn-outline text-[11px] py-1 px-2.5 text-amber-700 border-amber-300 hover:bg-amber-50 flex items-center gap-1 font-semibold"
                        title="Revoke verification badge and return to review"
                      >
                        <XCircle size={12} />
                        <span>Cancel Verification</span>
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(v.id)}
                        disabled={processingId === v.id}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Permanently Delete Portfolio Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Problems Moderation & Listing */}
      {activeTab === "problems" && (
        <div className="space-y-4 animate-feed-enter">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Problem Filter:</span>
              <select
                value={problemStatusFilter}
                onChange={(e) => setProblemStatusFilter(e.target.value)}
                className="input text-xs py-1.5 px-3 w-auto font-semibold"
              >
                <option value="ALL">All Problems ({problems.length})</option>
                <option value="ACTIVE">All Active ({problems.filter((p) => !p.isDeleted).length})</option>
                <option value="PENDING">Pending Approval</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved (Live)</option>
                <option value="REJECTED">Rejected</option>
                <option value="DELETED">Deleted Problems ({problems.filter((p) => p.isDeleted).length})</option>
              </select>
            </div>

            <div className="relative flex-1 sm:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                placeholder="Search title, location, citizen..."
                className="input text-xs pl-9 py-1.5"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className={`card p-5 flex flex-wrap items-center justify-between gap-4 ${
                  problem.isDeleted ? "bg-red-50/30 border-red-200" : ""
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {problem.isDeleted && (
                      <span className="badge bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-300">
                        🗑️ Soft Deleted
                      </span>
                    )}
                    <ApprovalStatusPill status={problem.approvalStatus} />
                    <span className="badge bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                      {problem.category.replace("_", " ")}
                    </span>
                    <StatusPill status={problem.status} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{problem.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{problem.location}</span>
                    </span>
                    <span>•</span>
                    <span>Reported by {problem.postedBy.name}</span>
                    <span>•</span>
                    <span>{problem._count?.solutions || 0} solutions</span>
                  </div>

                  {problem.approvalStatus === "REJECTED" && problem.rejectionReason && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                      Rejection Reason: {problem.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Approval Status Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Approval:</span>
                    <select
                      value={problem.approvalStatus}
                      onChange={(e) => handleUpdateProblemApprovalStatus(problem.id, e.target.value)}
                      disabled={processingId === problem.id}
                      className="input text-xs py-1 px-2.5 w-auto font-semibold border-gray-200 bg-white"
                    >
                      <option value="PENDING">⏳ Pending</option>
                      <option value="UNDER_REVIEW">🔍 Under Review</option>
                      <option value="APPROVED">✅ Approved</option>
                      <option value="REJECTED">❌ Rejected</option>
                    </select>
                  </div>

                  {/* Problem Resolution Status Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
                    <select
                      value={problem.status}
                      onChange={(e) => handleUpdateProblemStatus(problem.id, e.target.value)}
                      disabled={processingId === problem.id}
                      className="input text-xs py-1 px-2.5 w-auto font-semibold border-emerald-200 bg-emerald-50/60 text-emerald-900"
                    >
                      <option value="OPEN">🆕 Open</option>
                      <option value="SOLUTION_PROPOSED">💡 Solution Proposed</option>
                      <option value="PARTNERSHIP_APPROVED">🤝 Partnership Approved</option>
                      <option value="RESOLVED">✅ Resolved</option>
                    </select>
                  </div>

                  {problem.isDeleted ? (
                    <button
                      onClick={() => handleRestoreProblem(problem.id)}
                      disabled={processingId === problem.id}
                      className="btn-outline text-xs py-1 px-2.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                      title="Restore problem"
                    >
                      <RefreshCw size={13} />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteProblem(problem.id)}
                      disabled={processingId === problem.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Problem"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Solutions Moderation */}
      {activeTab === "solutions" && (
        <div className="space-y-4 animate-feed-enter">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Academic Solutions Registry</h2>
            <p className="text-xs text-gray-500">Overview of technical solutions submitted by universities</p>
          </div>

          <div className="space-y-3">
            {solutions.map((sol) => (
              <div key={sol.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="badge bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                    <Building2 size={12} />
                    <span>{sol.university.name}</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{sol.title}</h3>
                <p className="text-xs text-gray-500">
                  Addressing Problem:{" "}
                  <span className="font-semibold text-gray-700">{sol.problem.title}</span> (
                  {sol.problem.location})
                </p>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{sol.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400 font-mono">
                    ID: {sol.id}
                  </span>
                  <button
                    onClick={() => handleDeleteSolution(sol.id)}
                    disabled={processingId === sol.id}
                    className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold"
                    title="Delete proposed academic solution"
                  >
                    <Trash2 size={13} />
                    <span>Delete Solution</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Modal Dialog */}
      {ratingPartnership && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleSaveRating}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-100 animate-dropdown"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="badge bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                  Completed Partnership Evaluation
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">
                  Evaluate {ratingPartnership.industry?.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Solution: <span className="font-semibold text-gray-700">{ratingPartnership.solution?.title}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRatingPartnership(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {ratingError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{ratingError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Score 1: Quality */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-700">💎 Quality of Deliverables (1–5)</label>
                  <span className="font-black text-amber-600">{qualityScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Score 2: Budget */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-700">💰 Budget & Resource Adherence (1–5)</label>
                  <span className="font-black text-amber-600">{budgetAdherenceScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={budgetAdherenceScore}
                  onChange={(e) => setBudgetAdherenceScore(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Score 3: Timeliness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-700">⏱️ Timeliness & Schedule (1–5)</label>
                  <span className="font-black text-amber-600">{timelinessScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={timelinessScore}
                  onChange={(e) => setTimelinessScore(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Score 4: Communication */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-700">💬 Communication & Transparency (1–5)</label>
                  <span className="font-black text-amber-600">{communicationScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={communicationScore}
                  onChange={(e) => setCommunicationScore(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Admin Assessment & Comment (optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="e.g. Excellent execution, completed 2 weeks ahead of schedule with full CSR milestone compliance..."
                  className="input text-xs p-3"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRatingPartnership(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingRating}
                className="btn-primary text-xs py-2.5 px-6 font-bold bg-amber-600 hover:bg-amber-700"
              >
                {isSavingRating ? "Saving..." : "Save Rating"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Reason Modal Dialog */}
      {rejectingProblemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={22} />
              <h3 className="text-lg font-bold text-gray-900">Reject Problem Submission</h3>
            </div>
            <p className="text-xs text-gray-500">
              Please provide a reason for rejecting this submission. The submitting citizen will be notified with this message.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Duplicate submission, invalid location, or violates community guidelines..."
              className="input text-sm p-3"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingProblemId(null);
                  setRejectionReason("");
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectProblem}
                disabled={processingId !== null}
                className="btn-danger text-xs py-2 px-5 font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
