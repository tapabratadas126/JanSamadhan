"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Handshake, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

interface ProposePartnershipFormProps {
  solutionId: string;
  role?: string;
}

export default function ProposePartnershipForm({ solutionId, role }: ProposePartnershipFormProps) {
  const router = useRouter();
  const [proposalDetails, setProposalDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (role !== "INDUSTRY") {
    return (
      <div className="card p-6 text-center space-y-3 bg-[#FAFAF9] border-dashed border-2 border-amber-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <Handshake size={24} />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Propose Industry Partnership</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {role
            ? "Only registered Industry Partner accounts can submit partnership proposals."
            : "Sign in with an Industry account to offer CSR funding, manufacturing, or engineering support for this solution."}
        </p>
        {!role && (
          <button
            onClick={() => router.push(`/login?redirect=/solutions/${solutionId}`)}
            className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 w-full justify-center"
          >
            <span>Sign in as Industry</span>
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
      const res = await fetch(`/api/solutions/${solutionId}/partnerships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit partnership proposal");
      }

      setSuccess(true);
      setProposalDetails("");
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
        <h3 className="font-bold text-emerald-900 text-lg">Partnership Proposed!</h3>
        <p className="text-xs text-emerald-700">
          Your proposal has been submitted to Admin for moderation and approval.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="btn-outline text-xs py-2 px-4 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
        >
          Propose another partnership
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
          <Handshake size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Propose Partnership</h3>
          <p className="text-[11px] text-gray-500">Commit CSR funding or technical execution</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="label text-xs">
          Partnership Proposal & Resource Commitment *
        </label>
        <textarea
          rows={5}
          value={proposalDetails}
          onChange={(e) => setProposalDetails(e.target.value)}
          placeholder="Specify CSR budget allocation (e.g. ₹5 Lakhs), technical personnel / engineers provided, equipment / material sponsorships, and timeline..."
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
            <Handshake size={16} />
            <span>Submit Partnership Proposal</span>
          </>
        )}
      </button>
    </form>
  );
}
