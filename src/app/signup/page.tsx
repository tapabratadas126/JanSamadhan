"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { tr } = useLanguage();
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

    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] bg-gradient-to-b from-teal-50/40 via-white to-[#FAFAF9] flex items-center justify-center p-4 py-12 selection:bg-indigo-100">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#14B8A6] to-[#6366F1] rounded-2xl mb-3.5 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform no-underline">
            <MapPin className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-3xl font-extrabold text-[#1F2933]">{tr("signup_heading")}</h1>
          <p className="text-gray-500 mt-1 text-sm">{tr("signup_subtitle")}</p>
        </div>

        <div className="card shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role picker */}
            <div>
              <label className="label">{tr("signup_role_label")}</label>
              <div className="grid grid-cols-1 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update("role", r.value)}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all duration-150 text-left ${
                        isSelected
                          ? "border-[#6366F1] bg-indigo-50/60 shadow-sm"
                          : "border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/60"
                      }`}
                    >
                      <span className="text-3xl" role="img" aria-label={r.label}>
                        {r.emoji}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{r.label}</div>
                        <div className="text-xs text-gray-500">{r.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#6366F1] rounded-full flex items-center justify-center text-white">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {(form.role === "UNIVERSITY" || form.role === "INDUSTRY") && (
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                <label className="label flex items-center gap-1.5 text-indigo-900 font-bold">
                  <span>{tr("signup_org_label")}</span>
                  <span className="text-red-500 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  className="input border-indigo-200 focus:border-indigo-500 bg-white"
                  placeholder={
                    form.role === "UNIVERSITY"
                      ? tr("signup_org_placeholder_uni")
                      : tr("signup_org_placeholder_industry")
                  }
                  value={form.orgName}
                  onChange={(e) => update("orgName", e.target.value)}
                  required
                />
                <p className="text-[11px] text-indigo-600 font-medium">
                  {tr("signup_org_hint")}
                </p>
              </div>
            )}

            <div>
              <label className="label">{tr("signup_name_label")}</label>
              <input
                type="text"
                className="input"
                placeholder={tr("signup_name_placeholder")}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">{tr("signup_email_label")}</label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <label className="label">{tr("signup_phone_label")}</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 -mt-2">{tr("signup_contact_hint")}</p>

            <div>
              <label className="label">{tr("signup_password_label")}</label>
              <input
                type="password"
                className="input"
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
              className="btn-primary w-full py-3.5 text-base font-bold justify-center mt-2"
            >
              {loading ? tr("signup_btn_loading") : tr("signup_btn")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
            {tr("signup_have_account")}{" "}
            <Link href="/login" className="font-bold text-[#6366F1] hover:underline no-underline">
              {tr("signup_login_link")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
