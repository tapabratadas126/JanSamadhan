"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import CategoryPicker from "@/components/problems/CategoryPicker";
import GoogleMapLocationPicker from "@/components/problems/GoogleMapLocationPicker";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
}

export default function EditProblemForm({ problem }: { problem: Problem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: problem.title,
    description: problem.description,
    category: problem.category,
    location: problem.location,
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/problems/${problem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save changes");
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-xs py-2 px-4">
        <Pencil size={14} />
        <span>Edit Report</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-dropdown">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAFAF9]">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Problem Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">Updates are recorded in the public edit history</p>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="label">Problem Title</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Location *</label>
              <button
                type="button"
                onClick={() => setShowMapPicker((prev) => !prev)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <span>📍</span>
                <span>{showMapPicker ? "Hide Map / GPS" : "Pick on Map / GPS"}</span>
              </button>
            </div>
            <input
              type="text"
              className="input font-medium text-gray-800"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Ward 12, Main Bazar, Bokaro Steel City"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              You can manually type/edit your address above or use the interactive map picker.
            </p>

            {showMapPicker && (
              <div className="mt-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2 animate-dropdown">
                <GoogleMapLocationPicker
                  value={form.location}
                  onChange={(val) => update("location", val)}
                  placeholder="Search location or drag pin on map..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="label">Category</label>
            <CategoryPicker selected={form.category} onChange={(v) => update("category", v)} />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input h-32 resize-none"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
