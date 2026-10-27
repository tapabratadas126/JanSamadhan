"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Check, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tr } = useLanguage();

  const redirectParam = searchParams.get("redirect");
  const isReportingProblem = redirectParam?.includes("problems/new") || redirectParam?.includes("citizen");

  const [form, setForm] = useState({
    name: "",
    orgName: "",
    email: "",
    phone: "",
    password: "",
    role: "CITIZEN",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Role definitions — labels/descs pulled from translations
  const ROLES = [
    {
      value: "CITIZEN",
      label: tr("signup_role_citizen_label"),
      desc: tr("signup_role_citizen_desc"),
      emoji: "🧑",
    },
    {
      value: "UNIVERSITY",
      label: tr("signup_role_university_label"),
      desc: tr("signup_role_university_desc"),
      emoji: "🎓",
    },
    {
      value: "INDUSTRY",
      label: tr("signup_role_industry_label"),
      desc: tr("signup_role_industry_desc"),
      emoji: "🏭",
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.email && !form.phone) {
      setError(tr("signup_error_contact"));
      return;
    }

    if ((form.role === "UNIVERSITY" || form.role === "INDUSTRY") && !form.orgName.trim()) {
      setError(tr("signup_error_org"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        org_name: form.orgName.trim() || undefined,
        orgName: form.orgName.trim() || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || tr("signup_error_default"));
      return;
    }

    const destination =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : data.redirectTo;

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="w-full max-w-xl my-8">
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
          <p className="text-[#171e19] text-xs font-mono font-bold uppercase tracking-wider">{tr("signup_subtitle")}</p>
        </div>
      </div>

      {/* Main Boxed Window Container */}
      <div className="border-3 border-[#171e19] bg-white shadow-[8px_8px_0_0_#171e19]">
        {/* Retro Window Header Bar */}
        <div className="bg-[#171e19] text-white px-4 py-2.5 flex items-center justify-between border-b-3 border-[#171e19]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 border border-white bg-[#ff6b6b] inline-block"></span>
            <span className="w-3 h-3 border border-white bg-[#ffe17c] inline-block"></span>
            <span className="w-3 h-3 border border-white bg-[#b7c6c2] inline-block"></span>
            <span className="ml-2 font-mono text-xs font-bold uppercase tracking-widest text-[#ffe17c]">
              ACCOUNT_REGISTRATION.EXE
            </span>
          </div>
          <span className="font-mono text-[10px] text-gray-300">NEW USER</span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171e19]">CREATE ACCOUNT</h2>
            <p className="text-xs font-mono font-bold text-[#171e19]/70 mt-1 uppercase">Join the civic action network</p>
          </div>

          {isReportingProblem && (
            <div className="bg-[#ffe17c] border-2 border-[#171e19] shadow-[3px_3px_0_0_#171e19] text-[#171e19] p-3.5 text-xs font-mono font-bold flex items-center gap-2.5">
              <Info size={18} className="text-[#171e19] shrink-0" />
              <span>
                Create an account to report civic issues. You will be redirected right to the report form.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-[#ff6b6b] border-2 border-[#171e19] shadow-[3px_3px_0_0_#171e19] text-white p-3.5 text-xs font-mono font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Boxed Role Picker Section */}
            <div className="border-2 border-[#171e19] bg-[#faf9f6] p-4 shadow-[3px_3px_0_0_#171e19]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-3 font-mono">
                {tr("signup_role_label")}
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = form.role === r.value;
                  return (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3.5 border-2 border-[#171e19] cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#ffe17c] shadow-[3px_3px_0_0_#171e19] translate-x-[-1px] translate-y-[-1px]"
                          : "bg-white hover:bg-[#b7c6c2]/20 shadow-[2px_2px_0_0_#171e19]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={isSelected}
                        onChange={(e) => update("role", e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-xl shrink-0 mt-0.5">{r.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-sm text-[#171e19]">{r.label}</span>
                          {isSelected && (
                            <span className="w-5 h-5 border-2 border-[#171e19] bg-[#171e19] text-white flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={4} />
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-[#171e19]/75 mt-0.5 leading-snug">{r.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Boxed Input: Full Name */}
            <div className="border-2 border-[#171e19] bg-[#faf9f6] p-3 shadow-[3px_3px_0_0_#171e19]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-1 font-mono">
                {tr("signup_name_label")}
              </label>
              <input
                type="text"
                className="w-full bg-white border-2 border-[#171e19] p-2.5 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                placeholder={tr("signup_name_placeholder")}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            {/* Boxed Input: Organization (if University or Industry) */}
            {(form.role === "UNIVERSITY" || form.role === "INDUSTRY") && (
              <div className="border-2 border-[#171e19] bg-[#b7c6c2]/30 p-3.5 shadow-[3px_3px_0_0_#171e19] space-y-1.5">
                <label className="flex items-center gap-1.5 text-[#171e19] text-xs font-black uppercase tracking-wider font-mono">
                  <span>{tr("signup_org_label")}</span>
                  <span className="text-[#ff6b6b] font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-white border-2 border-[#171e19] p-2.5 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                  placeholder={
                    form.role === "UNIVERSITY"
                      ? tr("signup_org_placeholder_uni")
                      : tr("signup_org_placeholder_industry")
                  }
                  value={form.orgName}
                  onChange={(e) => update("orgName", e.target.value)}
                  required
                />
                <p className="font-mono text-[11px] text-[#171e19]/80 font-bold">
                  {tr("signup_org_hint")}
                </p>
              </div>
            )}

            {/* Boxed Inputs: Email & Phone Grid */}
            <div className="border-2 border-[#171e19] bg-[#faf9f6] p-3 shadow-[3px_3px_0_0_#171e19] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-1 font-mono">
                    {tr("signup_email_label")}
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white border-2 border-[#171e19] p-2.5 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-1 font-mono">
                    {tr("signup_phone_label")}
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-white border-2 border-[#171e19] p-2.5 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
              </div>
              <p className="font-mono text-[11px] text-[#171e19]/70 font-semibold">{tr("signup_contact_hint")}</p>
            </div>

            {/* Boxed Input: Password */}
            <div className="border-2 border-[#171e19] bg-[#faf9f6] p-3 shadow-[3px_3px_0_0_#171e19]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#171e19] mb-1 font-mono">
                {tr("signup_password_label")}
              </label>
              <input
                type="password"
                className="w-full bg-white border-2 border-[#171e19] p-2.5 text-sm font-mono text-[#171e19] focus:outline-none focus:bg-[#ffe17c]/20 focus:shadow-[2px_2px_0_0_#171e19] transition-all"
                placeholder={tr("signup_password_placeholder")}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-base font-black uppercase tracking-wider bg-[#ffe17c] text-[#171e19] border-3 border-[#171e19] shadow-[4px_4px_0_0_#171e19] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#171e19] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#171e19] transition-all cursor-pointer font-mono"
            >
              {loading ? tr("signup_btn_loading") : tr("signup_btn")}
            </button>
          </form>

          <div className="pt-4 border-t-2 border-dashed border-[#171e19] text-center">
            <p className="font-mono text-xs sm:text-sm font-bold text-[#171e19]">
              {tr("signup_have_account")}{" "}
              <Link
                href={
                  redirectParam
                    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
                    : "/login"
                }
                className="bg-[#b7c6c2] border border-[#171e19] px-2 py-0.5 shadow-[1px_1px_0_0_#171e19] hover:bg-[#ffe17c] transition-colors ml-1 text-[#171e19] underline no-underline font-black"
              >
                {tr("signup_login_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div
      className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 py-12 selection:bg-[#ffe17c]"
      style={{
        backgroundImage: `radial-gradient(#171e19 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      <Suspense fallback={<div className="font-mono text-sm text-[#171e19] border-2 border-[#171e19] bg-white p-3 shadow-[3px_3px_0_0_#171e19]">Loading signup...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
