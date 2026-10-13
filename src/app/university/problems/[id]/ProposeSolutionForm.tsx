"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

interface ProposeSolutionFormProps {
  problemId: string;
  role?: string;
}

export default function ProposeSolutionForm({ problemId, role }: ProposeSolutionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (role !== "UNIVERSITY") {
    return (
      <div className="card p-6 text-center space-y-3 bg-[#FAFAF9] border-dashed border-2 border-indigo-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#6366F1] flex items-center justify-center mx-auto shadow-sm">
          <Lightbulb size={24} />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Propose an Academic Solution</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {role
            ? "Only registered University accounts can submit technical solution proposals."
            : "Sign in with a University research account to propose an actionable technical solution."}
        </p>
        {!role && (
          <button
            onClick={() => router.push(`/login?redirect=/problems/${problemId}`)}
            className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 w-full justify-center"
          >
            <span>Sign in as University</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/problems/${problemId}/solutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit solution");
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card bg-emerald-50/70 border border-emerald-200 p-6 text-center space-y-3">
        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="font-bold text-emerald-900 text-lg">Solution Submitted!</h3>
        <p className="text-xs text-emerald-700">
          Your proposed solution is now published. Citizens and industry partners can view and propose partnerships.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="btn-outline text-xs py-2 px-4 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
        >
          Propose another solution
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
          <Lightbulb size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Propose Solution</h3>
          <p className="text-[11px] text-gray-500">Submit an academic or engineering methodology</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="label text-xs">Solution Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Low-cost bio-filtration water purification system"
          required
          className="input text-sm py-2.5"
        />
      </div>

      <div>
        <label className="label text-xs">Detailed Proposal & Methodology *</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain the technical design, required materials, budget estimate, timeline, and deployment approach..."
          required
          className="input text-sm py-2.5 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
      >
        {loading ? (
          <span>Submitting proposal…</span>
        ) : (
          <>
            <Lightbulb size={16} />
            <span>Submit Solution Proposal</span>
          </>
        )}
      </button>
    </form>
  );
}
