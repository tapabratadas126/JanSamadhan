"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";

export default function DeleteProblemButton({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/problems/${problemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete problem");
        setLoading(false);
        return;
      }

      setOpen(false);
      router.push("/citizen/my-problems");
      router.refresh();
    } catch (e) {
      setError("Network error while deleting problem");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline text-xs py-2 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold inline-flex items-center gap-1.5"
      >
        <Trash2 size={14} />
        <span>Delete Problem</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-5 animate-dropdown">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
            <AlertTriangle size={20} />
            <span>Confirm Problem Deletion</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to delete this reported problem? It will be permanently removed from public and personal listings, but an audit log will be retained for system record.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="btn-ghost text-xs py-2 px-4 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>{loading ? "Deleting..." : "Confirm Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
