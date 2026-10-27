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
    <div className="w-full max-w-md my-8">
      {/* Logo / Brand */}
      <div className="text-center mb-6 flex flex-col items-center">
        <Link href="/" className="inline-block hover:opacity-95 transition-opacity no-underline mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-full.png"
            alt="JanSamadhan — Local voices. Shared solutions."
            className="h-16 w-auto object-contain mx-auto"
          />
        </Link>
        <div className="inline-block border-2 border-[#171e19] bg-[#ffe17c] px-3 py-1 shadow-[2px_2px_0_0_#171e19] mt-1">
          <p className="text-[#171e19] text-xs font-mono font-bold uppercase tracking-wider">{tr("login_subtitle")}</p>
        </div>
      </div>

      {/* Main Boxed Container with Retro Window Bar */}
      <div className="border-3 border-[#171e19] bg-white shadow-[8px_8px_0_0_#171e19]">
        {/* Retro Window Header Bar */}
        <div className="bg-[#171e19] text-white px-4 py-2.5 flex items-center justify-between border-b-3 border-[#171e19]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 border border-white bg-[#ff6b6b] inline-block"></span>
            <span className="w-3 h-3 border border-white bg-[#ffe17c] inline-block"></span>
            <span className="w-3 h-3 border border-white bg-[#b7c6c2] inline-block"></span>
            <span className="ml-2 font-mono text-xs font-bold uppercase tracking-widest text-[#ffe17c]">
              AUTH_PORTAL.EXE
            </span>
          </div>
          <span className="font-mono text-[10px] text-gray-300">SECURE LOGIN</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171e19]">{tr("login_welcome")}</h2>
            <p className="text-xs font-mono font-bold text-[#171e19]/70 mt-1 uppercase">{tr("login_welcome_sub")}</p>
          </div>

          {isReportingProblem && (
            <div className="bg-[#ffe17c] border-2 border-[#171e19] shadow-[3px_3px_0_0_#171e19] text-[#171e19] p-3.5 text-xs font-mono font-bold flex items-center gap-2.5">
              <Info size={18} className="text-[#171e19] shrink-0" />
              <span>
                Please sign in to report a problem. You will be redirected straight to the report form.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-[#ff6b6b] border-2 border-[#171e19] shadow-[3px_3px_0_0_#171e19] text-white p-3.5 text-xs font-mono font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-white" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Boxed Input 1 */}
            <div className="border-2 border-[#171e19] bg-[#faf9f6] p-3 shadow-[3px_3px_0_0_#171e19]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-1 font-mono">
                {tr("login_identifier_label")}
              </label>
              <input
                type="text"
                className="w-full bg-white border-2 border-[#171e19] p-2.5 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                placeholder={tr("login_identifier_placeholder")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Boxed Input 2 */}
            <div className="border-2 border-[#171e19] bg-[#faf9f6] p-3 shadow-[3px_3px_0_0_#171e19]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-1 font-mono">
                {tr("login_password_label")}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full bg-white border-2 border-[#171e19] p-2.5 pr-12 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                  placeholder={tr("login_password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 border-2 border-[#171e19] bg-white p-1 hover:bg-[#ffe17c] text-[#171e19] shadow-[1px_1px_0_0_#171e19] cursor-pointer"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? tr("login_hide_pw") : tr("login_show_pw")}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-base font-black uppercase tracking-wider bg-[#ffe17c] text-[#171e19] border-3 border-[#171e19] shadow-[4px_4px_0_0_#171e19] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#171e19] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#171e19] transition-all cursor-pointer font-mono"
            >
              {loading ? tr("login_btn_loading") : tr("login_btn")}
            </button>
          </form>

          <div className="pt-4 border-t-2 border-dashed border-[#171e19] text-center">
            <p className="font-mono text-xs sm:text-sm font-bold text-[#171e19]">
              {tr("login_no_account")}{" "}
              <Link
                href={
                  redirectParam
                    ? `/signup?redirect=${encodeURIComponent(redirectParam)}`
                    : "/signup"
                }
                className="bg-[#b7c6c2] border border-[#171e19] px-2 py-0.5 shadow-[1px_1px_0_0_#171e19] hover:bg-[#ffe17c] transition-colors ml-1 text-[#171e19] underline no-underline font-black"
              >
                {tr("login_create_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 selection:bg-[#ffe17c]"
      style={{
        backgroundImage: `radial-gradient(#171e19 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      <Suspense fallback={<div className="font-mono text-sm text-[#171e19] border-2 border-[#171e19] bg-white p-3 shadow-[3px_3px_0_0_#171e19]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
