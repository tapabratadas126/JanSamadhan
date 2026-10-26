"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tr } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectParam = searchParams.get("redirect");
  const isReportingProblem = redirectParam?.includes("problems/new") || redirectParam?.includes("citizen");

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

    // Safely redirect to requested page if internal relative URL, otherwise fallback to role dashboard
    const destination =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : data.redirectTo;

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo / Brand */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Link href="/" className="inline-block hover:opacity-95 transition-opacity no-underline mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-full.png"
            alt="JanSamadhan — Local voices. Shared solutions."
            className="h-16 w-auto object-contain mx-auto"
          />
        </Link>
        <p className="text-gray-500 text-xs sm:text-sm">{tr("login_subtitle")}</p>
      </div>

      <div className="card shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{tr("login_welcome")}</h2>
          <p className="text-xs text-gray-500 mt-1">{tr("login_welcome_sub")}</p>
        </div>

        {isReportingProblem && (
          <div className="bg-[#E4E9F5] border border-[#17254A]/20 text-[#17254A] rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2.5">
            <Info size={16} className="text-[#17254A] shrink-0" />
            <span>
              Please sign in to report a problem. You will be redirected straight to the report form.
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
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
          <Link
            href={
              redirectParam
                ? `/signup?redirect=${encodeURIComponent(redirectParam)}`
                : "/signup"
            }
            className="font-bold text-[#6366F1] hover:underline no-underline"
          >
            {tr("login_create_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] bg-gradient-to-b from-teal-50/40 via-white to-[#FAFAF9] flex items-center justify-center p-4 selection:bg-indigo-100">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
