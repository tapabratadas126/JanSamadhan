"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { tr } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || tr("login_error_default"));
      return;
    }

    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] bg-gradient-to-b from-teal-50/40 via-white to-[#FAFAF9] flex items-center justify-center p-4 selection:bg-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#14B8A6] to-[#6366F1] rounded-2xl mb-3.5 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform no-underline">
            <MapPin className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-3xl font-extrabold text-[#1F2933]">JanSamadhan</h1>
          <p className="text-gray-500 mt-1 text-sm">{tr("login_subtitle")}</p>
        </div>

        <div className="card shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tr("login_welcome")}</h2>
            <p className="text-xs text-gray-500 mt-1">{tr("login_welcome_sub")}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{tr("login_identifier_label")}</label>
              <input
                type="text"
                className="input"
                placeholder={tr("login_identifier_placeholder")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">{tr("login_password_label")}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-12"
                  placeholder={tr("login_password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? tr("login_hide_pw") : tr("login_show_pw")}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-bold justify-center mt-2"
            >
              {loading ? tr("login_btn_loading") : tr("login_btn")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
            {tr("login_no_account")}{" "}
            <Link href="/signup" className="font-bold text-[#6366F1] hover:underline no-underline">
              {tr("login_create_link")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
