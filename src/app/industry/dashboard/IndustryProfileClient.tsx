"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Briefcase,
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Award,
  AlertCircle,
  Save,
  Eye,
} from "lucide-react";
import StarRating, { CriteriaScoreBar } from "@/components/industry/StarRating";

interface IndustryProfileClientProps {
  userId: string;
  initialProfile: {
    companyName: string;
    description: string;
    website: string | null;
  };
  initialPortfolio: any[];
  stats: {
    totalProposed: number;
    approvedCount: number;
    rejectedCount: number;
    completedCount: number;
  };
  ratings: any[];
  ratingSummary: {
    count: number;
    overallAverage: number;
    breakdown: {
      quality: number;
      budgetAdherence: number;
      timeliness: number;
      communication: number;
    };
  };
}

export default function IndustryProfileClient({
  userId,
  initialProfile,
  initialPortfolio,
  stats,
  ratings,
  ratingSummary,
}: IndustryProfileClientProps) {
  const router = useRouter();

  // Profile edit state
  const [companyName, setCompanyName] = useState(initialProfile.companyName || "");
  const [description, setDescription] = useState(initialProfile.description || "");
  const [website, setWebsite] = useState(initialProfile.website || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Portfolio state
  const [portfolioList, setPortfolioList] = useState(initialPortfolio);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [clientOrAuthority, setClientOrAuthority] = useState("");
  const [yearCompleted, setYearCompleted] = useState(new Date().getFullYear().toString());
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"stats" | "profile" | "portfolio">("stats");

  // Handle Save Profile
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/industry/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, description, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
      router.refresh();
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Handle Add Portfolio Entry
  async function handleAddPortfolio(e: React.FormEvent) {
    e.preventDefault();
    setIsAddingPortfolio(true);
    setPortfolioError(null);

    try {
      const res = await fetch("/api/industry/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          description: portfolioDescription,
          clientOrAuthority,
          yearCompleted: parseInt(yearCompleted, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add portfolio entry");
      }

      setPortfolioList([data.entry, ...portfolioList]);
      setProjectTitle("");
      setPortfolioDescription("");
      setClientOrAuthority("");
      setYearCompleted(new Date().getFullYear().toString());
      setShowAddPortfolio(false);
      router.refresh();
    } catch (err: any) {
      setPortfolioError(err.message || "Failed to add portfolio entry");
    } finally {
      setIsAddingPortfolio(false);
    }
  }

  // Handle Delete Portfolio Entry
  async function handleDeletePortfolio(id: string) {
    if (!confirm("Are you sure you want to delete this portfolio project record?")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/industry/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPortfolioList(portfolioList.filter((p) => p.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error deleting entry");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation sub-tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 shadow-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("stats")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "stats"
              ? "border-amber-500 text-amber-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Award size={17} />
          <span>Track Record & Ratings</span>
        </button>

        <button
          onClick={() => setActiveTab("portfolio")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "portfolio"
              ? "border-[#6366F1] text-[#6366F1]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Briefcase size={17} />
          <span>Project Portfolio</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {portfolioList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "profile"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Edit3 size={17} />
          <span>Edit Company Profile</span>
        </button>

        <div className="ml-auto py-2 flex items-center">
          <Link
            href={`/industry/${userId}`}
            target="_blank"
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 no-underline font-semibold"
          >
            <Eye size={14} />
            <span>View Public Profile</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Tab 1: Stats & Performance Ratings */}
      {activeTab === "stats" && (
        <div className="space-y-6 animate-feed-enter">
          {/* Track Record Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Proposals Submitted
              </span>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalProposed}</div>
              <p className="text-[11px] text-gray-500 mt-1">Total partnerships proposed</p>
            </div>

            <div className="card p-5 bg-emerald-50/50 border border-emerald-200/80 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Approved
              </span>
              <div className="text-3xl font-extrabold text-emerald-950 mt-1">{stats.approvedCount}</div>
              <p className="text-[11px] text-emerald-700 mt-1">Accepted proposals</p>
            </div>

            <div className="card p-5 bg-purple-50/50 border border-purple-200/80 shadow-xs">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Completed
              </span>
              <div className="text-3xl font-extrabold text-purple-950 mt-1">{stats.completedCount}</div>
              <p className="text-[11px] text-purple-700 mt-1">Implementation finished</p>
            </div>

            <div className="card p-5 bg-rose-50/50 border border-rose-200/80 shadow-xs">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Rejected
              </span>
              <div className="text-3xl font-extrabold text-rose-950 mt-1">{stats.rejectedCount}</div>
              <p className="text-[11px] text-rose-700 mt-1">Declined proposals</p>
            </div>
          </div>

          {/* Rating Summary Card */}
          <div className="card p-6 bg-white border border-gray-200/80 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⭐</span>
              <span>Platform Ratings Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:border-r border-gray-100 md:pr-6 py-2 flex flex-col items-center justify-center space-y-2">
                <div className="text-5xl font-black text-gray-900 tracking-tight">
                  {ratingSummary.overallAverage > 0 ? ratingSummary.overallAverage.toFixed(1) : "—"}
                </div>
                <StarRating score={ratingSummary.overallAverage} size={22} showText={false} />
                <div className="text-xs text-gray-500 font-medium">
                  {ratingSummary.count > 0 ? (
                    <span>
                      Based on <strong>{ratingSummary.count}</strong> completed partnership{" "}
                      {ratingSummary.count === 1 ? "rating" : "ratings"}
                    </span>
                  ) : (
                    <span className="italic">No completed ratings yet</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-3.5">
                <CriteriaScoreBar
                  label="Quality of Deliverables"
                  icon="💎"
                  score={ratingSummary.breakdown.quality}
                />
                <CriteriaScoreBar
                  label="Budget & Resource Adherence"
                  icon="💰"
                  score={ratingSummary.breakdown.budgetAdherence}
                />
                <CriteriaScoreBar
                  label="Timeliness & Schedule"
                  icon="⏱️"
                  score={ratingSummary.breakdown.timeliness}
                />
                <CriteriaScoreBar
                  label="Communication & Transparency"
                  icon="💬"
                  score={ratingSummary.breakdown.communication}
                />
              </div>
            </div>
          </div>

          {/* Individual Ratings History */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">
              Administrative Evaluations ({ratings.length})
            </h3>

            {ratings.length === 0 ? (
              <div className="card text-center py-10 text-gray-500 space-y-1">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="font-semibold text-gray-700">No evaluations recorded yet</p>
                <p className="text-xs text-gray-400">
                  When administrators mark your approved partnerships as COMPLETED, their ratings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((r) => (
                  <div
                    key={r.id}
                    className="card p-5 space-y-3 border border-gray-200/90 shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <StarRating score={r.overallScore} size={15} />
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Rated by Admin ({r.ratedBy}) on{" "}
                            {new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base mt-1">
                          Solution: {r.solutionTitle}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Problem:{" "}
                          <Link
                            href={`/problems/${r.problemId}`}
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            {r.problemTitle}
                          </Link>{" "}
                          ({r.problemLocation})
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs shrink-0">
                        <div>Quality: <strong>{r.qualityScore}/5</strong></div>
                        <div>Budget: <strong>{r.budgetAdherenceScore}/5</strong></div>
                        <div>Timeliness: <strong>{r.timelinessScore}/5</strong></div>
                        <div>Communication: <strong>{r.communicationScore}/5</strong></div>
                      </div>
                    </div>

                    {r.comment && (
                      <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 text-xs text-gray-800 leading-relaxed italic">
                        &ldquo;{r.comment}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Project Portfolio Management */}
      {activeTab === "portfolio" && (
        <div className="space-y-6 animate-feed-enter">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Portfolio of Past Projects</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Self-reported civic interventions verified by administrators before public display
              </p>
            </div>

            <button
              onClick={() => setShowAddPortfolio((v) => !v)}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
            >
              <Plus size={15} />
              <span>{showAddPortfolio ? "Cancel" : "Add New Project"}</span>
            </button>
          </div>

          {/* Add Project Form Drawer/Modal */}
          {showAddPortfolio && (
            <form
              onSubmit={handleAddPortfolio}
              className="card p-6 border-2 border-indigo-200/80 bg-indigo-50/20 space-y-4 animate-dropdown"
            >
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <span>📁</span>
                <span>Submit New Project for Administrative Verification</span>
              </h4>

              {portfolioError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{portfolioError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Solar Microgrid Installation in Rural Schools"
                    className="input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Client / Government Authority *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientOrAuthority}
                    onChange={(e) => setClientOrAuthority(e.target.value)}
                    placeholder="e.g. Jharkhand Renewable Energy Development Agency (JREDA)"
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Year Completed *
                </label>
                <input
                  type="number"
                  required
                  min="1990"
                  max="2099"
                  value={yearCompleted}
                  onChange={(e) => setYearCompleted(e.target.value)}
                  className="input text-sm max-w-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Project Description & Community Impact *
                </label>
                <textarea
                  required
                  rows={4}
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  placeholder="Detail scope, technologies deployed, CSR funding deployed, and outcomes for the community..."
                  className="input text-sm p-3"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPortfolio(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPortfolio}
                  className="btn-primary text-xs py-2 px-6 font-bold"
                >
                  {isAddingPortfolio ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          )}

          {/* Portfolio List */}
          {portfolioList.length === 0 ? (
            <div className="card text-center py-12 text-gray-500 space-y-2">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">No portfolio projects submitted yet</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Add your relevant civic and CSR projects above so platform administrators can verify and showcase them on your public profile!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioList.map((item) => (
                <div
                  key={item.id}
                  className={`card p-5 space-y-3 flex flex-col justify-between border ${
                    item.verified
                      ? "border-emerald-200 bg-white"
                      : "border-amber-200 bg-amber-50/20"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                        {item.yearCompleted}
                      </span>

                      <div className="flex items-center gap-2">
                        {item.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock size={13} className="text-amber-600" />
                            <span>Pending Verification</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleDeletePortfolio(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Project Entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 text-base">{item.projectTitle}</h4>
                    <p className="text-xs text-gray-500">
                      Client/Authority: <strong className="text-gray-700">{item.clientOrAuthority}</strong>
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                    {item.verified
                      ? `Verified on ${new Date(item.verifiedAt).toLocaleDateString("en-IN")}`
                      : "Pending administrative review (not visible on public profile yet)"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Edit Company Profile */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="card p-6 sm:p-8 bg-white border border-gray-200/80 shadow-xs space-y-6 animate-feed-enter max-w-2xl"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-900">Industry Partner Profile Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              These details appear on your public profile page (`/industry/[userId]`) and when universities review your partnership proposals.
            </p>
          </div>

          {profileMessage && (
            <div
              className={`p-3 text-xs rounded-xl border flex items-center gap-2 ${
                profileMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {profileMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Tata Steel CSR Foundation"
                className="input text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Website URL (optional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.company.com"
                  className="input pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Company Description & CSR Mission *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your organization, past civic initiatives, focus areas (e.g. water sanitation, rural education), and commitment to public welfare..."
                className="input text-sm p-3.5 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href={`/industry/${userId}`}
              className="text-xs text-indigo-600 hover:underline font-semibold"
              target="_blank"
            >
              Preview Public Page →
            </Link>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-1.5 font-bold"
            >
              <Save size={15} />
              <span>{isSavingProfile ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
