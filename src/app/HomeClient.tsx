"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  MapPin,
  Building2,
  Handshake,
  Lightbulb,
  Search,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  User,
  GraduationCap,
  ShieldCheck,
  Check,
  Sparkles,
  Sprout,
} from "lucide-react";
import { CATEGORIES } from "@/components/problems/CategoryPicker";
import ProblemCard, { StatusPill } from "@/components/problems/ProblemCard";
import { useLanguage } from "@/context/LanguageContext";
import BrandLogo from "@/components/layout/BrandLogo";
import MorphingShape from "@/components/ui/MorphingShape";

// ── Data Shapes ─────────────────────────────────────────────────────────────
type ProblemItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  approvalStatus: string;
  upvoteCount: number;
  createdAt: Date | string;
  postedBy: { id: string; name: string };
  _count: { solutions: number };
  mediaUrls?: string;
};

type SolutionItem = {
  id: string;
  title: string;
  description: string;
  createdAt: Date | string;
  university: { id: string; name: string };
  problem: {
    id: string;
    title: string;
    category: string;
    location: string;
    status: string;
  };
  _count: { partnerships: number };
};

type PartnershipItem = {
  id: string;
  proposalDetails: string;
  status: string;
  industry: { id: string; name: string };
  reviewedBy: { id: string; name: string } | null;
  solution: {
    id: string;
    title: string;
    university: { id: string; name: string };
    problem: { id: string; title: string; category: string; location: string };
  };
};

type LatestChain = {
  id: string;
  title: string;
  category: string;
  location: string;
  postedBy: { name: string };
  solutions: Array<{
    title: string;
    university: { name: string };
    partnerships: Array<{
      industry: { name: string };
    }>;
  }>;
} | null;

interface HomeClientProps {
  session: { role: string; name: string } | null;
  problemCount: number;
  solutionCount: number;
  partnershipCount: number;
  categoryCounts?: Record<string, number>;
  latestChain?: LatestChain;
  problems: ProblemItem[];
  solutions: SolutionItem[];
  partnerships: PartnershipItem[];
  activeTab: string;
  selectedCategory: string;
  searchQuery: string;
}

// ── Dynamic Animated Counter Component ──────────────────────────────────────
function DynamicCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!isInView) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || value === 0) {
      setCount(value);
      return;
    }

    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeProgress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
    </span>
  );
}

export default function HomeClient({
  session,
  problemCount,
  solutionCount,
  partnershipCount,
  categoryCounts = {},
  latestChain,
  problems,
  solutions,
  partnerships,
  activeTab,
  selectedCategory,
  searchQuery,
}: HomeClientProps) {
  const { tr, lang } = useLanguage();

  // Prefer real database chain, or use realistic Jharkhand example
  const chainData = latestChain || {
    id: "sample-1",
    title: "Clean Drinking Water Solar Filtration in Latehar District",
    category: "WATER",
    location: "Latehar, Jharkhand",
    postedBy: { name: "Anand Soren" },
    solutions: [
      {
        title: "Low-Cost UV & Ceramic Solar Water Purifier",
        university: { name: "BIT Mesra Research Lab" },
        partnerships: [
          {
            industry: { name: "Tata Steel Rural Initiative" },
          },
        ],
      },
    ],
  };

  const isRealChain = !!latestChain;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#171e19] flex flex-col">
      {/* ─────────────────────────────────────────────────────────────────────
          MARQUEE TICKER — Neo-Brutalist accent bar
      ───────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#171e19] text-[#ffe17c] py-2 overflow-hidden border-b-[3px] border-[#ffe17c]">
        <div className="flex whitespace-nowrap nb-marquee">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="mx-8 text-xs font-bold uppercase tracking-[0.2em]">
              ★ CIVIC PROBLEMS ★ UNIVERSITY SOLUTIONS ★ INDUSTRY PARTNERSHIPS ★ LOCAL IMPACT ★ OPEN GOVERNANCE
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4.1 HERO SECTION — Neo-Brutalist: Bold yellow, hard shadows
      ───────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-[3px] border-[#171e19] py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#ffe17c]">
        {/* Organic Morphing Shape in Hero background */}
        <div className="absolute -top-24 -right-24 w-[540px] h-[540px] opacity-50 pointer-events-none z-0 hidden md:block">
          <MorphingShape className="w-full h-full" />
        </div>
        <div className="absolute -bottom-36 -left-36 w-[420px] h-[420px] opacity-30 pointer-events-none z-0 hidden lg:block">
          <MorphingShape className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow */}
            <div className="inline-block">
              <span className={`${lang === "hi" ? "eyebrow-hi" : "eyebrow-en"} text-[#171e19] bg-white px-3 py-1.5 border-2 border-[#171e19] inline-block`} style={{ boxShadow: "2px 2px 0px #171e19" }}>
                {tr("hero_eyebrow")}
              </span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#171e19] leading-[1.05] tracking-tight uppercase">
              <span>Connecting citizens, universities & </span>
              <span className="relative inline-block">
                industry
                {/* Bold underline stroke */}
                <svg
                  className="absolute left-0 -bottom-2 w-full h-4 overflow-visible pointer-events-none"
                  viewBox="0 0 160 14"
                  fill="none"
                >
                  <motion.path
                    d="M 2 10 C 45 3, 115 12, 158 6"
                    stroke="#171e19"
                    strokeWidth="5"
                    strokeLinecap="square"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
              </span>
              <span> to solve local challenges.</span>
            </h1>

            {/* Short subcopy */}
            <p className="text-base sm:text-lg text-[#171e19]/75 max-w-2xl leading-relaxed font-medium">
              {tr("hero_subtext")}
            </p>

            {/* Two CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={session ? "/citizen/problems/new" : "/login?redirect=/citizen/problems/new"}
                className="btn-primary text-sm font-extrabold px-7 py-3.5 no-underline"
              >
                <span>{tr("hero_cta_report")}</span>
                <ArrowRight size={18} strokeWidth={3} />
              </Link>
              <Link
                href="/#browse-section"
                className="btn-secondary text-sm font-bold px-7 py-3.5 no-underline"
              >
                {tr("hero_cta_browse")}
              </Link>
            </div>

            {/* Three Trust Ticks */}
            <div className="pt-5 flex flex-wrap items-center gap-6 text-xs text-[#171e19]/70 font-bold uppercase tracking-wider border-t-2 border-[#171e19]/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#171e19]" />
                <span>{tr("hero_trust_free")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#171e19]" />
                <span>{tr("hero_trust_verified")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#171e19]" />
                <span>{tr("hero_trust_transparent")}</span>
              </div>
            </div>
          </div>

          {/* Right Column (Span 5): Journey Visual — Brutalist card */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-7 border-[3px] border-[#171e19] space-y-4" style={{ boxShadow: "6px 6px 0px #171e19", borderRadius: "8px" }}>
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#171e19]/15">
                <span className="text-xs font-extrabold text-[#171e19] uppercase tracking-[0.15em]">
                  Civic Collaboration Journey
                </span>
                <span className="badge bg-[#ffe17c] text-[#171e19] border-[#171e19]">
                  {isRealChain ? "Live Chain" : "Example"}
                </span>
              </div>

              {/* Step 1: Citizen reports */}
              <div className="relative pl-9 pb-4">
                <div className="absolute left-0 top-0.5 w-7 h-7 bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] flex items-center justify-center font-extrabold text-xs" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  1
                </div>
                <div className="absolute left-3 top-8 bottom-0 w-[2px] bg-[#171e19]/20" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#171e19] uppercase">Citizen Reports</span>
                    <span className="text-[11px] text-[#171e19]/60 font-semibold">{chainData.location}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171e19] line-clamp-1">
                    {chainData.title}
                  </h4>
                  <p className="text-xs text-[#171e19]/60 font-medium">Reported by {chainData.postedBy.name}</p>
                </div>
              </div>

              {/* Step 2: University proposes */}
              <div className="relative pl-9 pb-4">
                <div className="absolute left-0 top-0.5 w-7 h-7 bg-[#b7c6c2] text-[#171e19] border-2 border-[#171e19] flex items-center justify-center font-extrabold text-xs" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  2
                </div>
                <div className="absolute left-3 top-8 bottom-0 w-[2px] bg-[#171e19]/20" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#171e19] uppercase">University Proposes</span>
                    <span className="text-[11px] text-[#171e19]/60 font-semibold">Research & Tech</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171e19] line-clamp-1">
                    {chainData.solutions[0]?.title || "Technical Feasibility Study"}
                  </h4>
                  <p className="text-xs text-[#171e19]/60 font-medium">
                    Lead: {chainData.solutions[0]?.university.name || "University Partner"}
                  </p>
                </div>
              </div>

              {/* Step 3: Industry backs */}
              <div className="relative pl-9">
                <div className="absolute left-0 top-0.5 w-7 h-7 bg-[#2d6a4f] text-white border-2 border-[#171e19] flex items-center justify-center font-extrabold text-xs" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  3
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#171e19] uppercase">Industry Backs</span>
                    <span className="badge status-approved text-[10px] py-0.5">Approved</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171e19] line-clamp-1">
                    {chainData.solutions[0]?.partnerships[0]?.industry.name || "Corporate CSR Deployment"}
                  </h4>
                  <p className="text-xs text-[#171e19]/60 font-medium">Sponsorship & Resource Deployment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.2 LIVE IMPACT BENTO GRID — Neo-Brutalist tiles
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-[3px] border-[#171e19] bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className={lang === "hi" ? "eyebrow-hi text-[#2d6a4f]" : "eyebrow-en text-[#2d6a4f]"}>
                {tr("bento_live_stats")}
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171e19] uppercase tracking-tight">
                Measurable Impact Across Communities
              </h2>
            </div>
            <Link
              href="#how-it-works"
              className="text-xs font-bold text-[#171e19] hover:text-[#ffe17c] bg-[#171e19] hover:bg-[#171e19] text-white px-4 py-2 border-2 border-[#171e19] inline-flex items-center gap-1 uppercase tracking-wider transition-colors no-underline"
              style={{ boxShadow: "2px 2px 0px #b7c6c2" }}
            >
              <span>How it works</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* 12-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {/* Tile A (span 5, 2 rows): Problems reported */}
            <div className="lg:col-span-5 lg:row-span-2 bento-tile flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] flex items-center justify-center" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <MapPin size={22} />
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold text-[#171e19]">
                  <DynamicCounter value={problemCount} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase tracking-wider">
                  {tr("metric_problems")}
                </h3>
                <p className="text-xs text-[#171e19]/60 leading-relaxed font-medium">
                  Verified civic issues submitted by citizens across urban and rural wards, prioritized by community votes.
                </p>
              </div>

              {problems[0] && (
                <div className="pt-4 border-t-2 border-[#171e19]/15 space-y-1">
                  <div className="text-[11px] font-extrabold text-[#171e19]/50 uppercase tracking-[0.15em]">
                    {tr("bento_latest_report")}
                  </div>
                  <Link
                    href={`/problems/${problems[0].id}`}
                    className="text-sm font-bold text-[#171e19] hover:text-[#2d6a4f] line-clamp-1 block transition-colors"
                  >
                    {problems[0].title}
                  </Link>
                  <span className="text-[11px] text-[#171e19]/50 font-semibold">{problems[0].location}</span>
                </div>
              )}
            </div>

            {/* Tile B (span 4): Solutions Proposed (Dark charcoal tile) */}
            <div className="lg:col-span-4 bento-tile bg-[#171e19] text-white border-[#171e19] flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #ffe17c" }}>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-[#ffe17c] text-[#171e19] border-2 border-white/30 flex items-center justify-center">
                  <Lightbulb size={20} />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#ffe17c]">
                  <DynamicCounter value={solutionCount} />
                </div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">
                  {tr("metric_solutions")}
                </h3>
              </div>
              <p className="text-xs text-white/60 pt-3 leading-relaxed font-medium">
                Applied research, prototypes, and engineering solutions designed by university faculties and research scholars.
              </p>
            </div>

            {/* Tile C (span 3): Partnerships Formed (Sage tile) */}
            <div className="lg:col-span-3 bento-tile bg-[#b7c6c2] border-[#171e19] text-[#171e19] flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #171e19" }}>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-[#2d6a4f] text-white border-2 border-[#171e19] flex items-center justify-center">
                  <Handshake size={20} />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#171e19]">
                  <DynamicCounter value={partnershipCount} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase tracking-wider">
                  {tr("metric_partnerships")}
                </h3>
              </div>
              <p className="text-xs text-[#171e19]/60 pt-3 leading-relaxed font-medium">
                Approved CSR partnerships backing civic solutions with deployment resources.
              </p>
            </div>

            {/* Tile D (span 7): How it Works in 3 Compact Steps */}
            <div className="lg:col-span-7 bento-tile space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#171e19] uppercase tracking-wider">
                  {tr("bento_how_title")}
                </h3>
                <Link
                  href="#how-it-works"
                  className="text-xs font-bold text-[#171e19] hover:text-[#2d6a4f] uppercase tracking-wider"
                >
                  View diagram →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#ffe17c] border-2 border-[#171e19] space-y-1" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <div className="text-xs font-extrabold text-[#171e19] uppercase">{tr("bento_how_step1")}</div>
                  <div className="text-[11px] text-[#171e19]/65 font-medium">Submit issues with photos & GPS.</div>
                </div>
                <div className="p-3 bg-[#b7c6c2] border-2 border-[#171e19] space-y-1" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <div className="text-xs font-extrabold text-[#171e19] uppercase">{tr("bento_how_step2")}</div>
                  <div className="text-[11px] text-[#171e19]/65 font-medium">Universities submit actionable R&D.</div>
                </div>
                <div className="p-3 bg-white border-2 border-[#171e19] space-y-1" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <div className="text-xs font-extrabold text-[#171e19] uppercase">{tr("bento_how_step3")}</div>
                  <div className="text-[11px] text-[#171e19]/65 font-medium">CSR partners fund and scale.</div>
                </div>
              </div>
            </div>

            {/* Tile E (span 5): 10 Categories with Live Counts */}
            <div className="lg:col-span-5 bento-tile space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#171e19] uppercase tracking-wider">
                  {tr("bento_categories_title")}
                </h3>
                <span className="text-[11px] text-[#171e19]/50 font-bold uppercase">10 Active Domains</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count = categoryCounts[cat.value] || 0;
                  return (
                    <Link
                      key={cat.value}
                      href={`/?tab=problems&category=${cat.value}#browse-section`}
                      title={`${cat.label}: ${count} problems`}
                      className="p-2 bg-[#faf9f6] hover:bg-[#ffe17c] border-2 border-[#171e19] flex flex-col items-center justify-center text-center transition-colors group no-underline"
                      style={{ boxShadow: "1px 1px 0px #171e19" }}
                    >
                      <Icon className="w-4 h-4 text-[#171e19] group-hover:text-[#171e19] transition-colors mb-1" />
                      <span className="text-[10px] font-extrabold text-[#171e19] leading-none">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tile F (span 4): Impact highlight */}
            <div className="lg:col-span-4 bento-tile space-y-2 bg-[#ffe17c]" style={{ boxShadow: "4px 4px 0px #171e19" }}>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#171e19] uppercase tracking-wider">
                <Sparkles size={14} />
                <span>{tr("bento_impact_title")}</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#171e19] uppercase">
                Institutional Civic Bridge
              </h4>
              <p className="text-xs text-[#171e19]/65 leading-relaxed font-medium">
                {tr("bento_impact_desc")}
              </p>
            </div>

            {/* Tile G (span 8): Who it's for with links */}
            <div className="lg:col-span-8 bento-tile space-y-3">
              <h3 className="font-extrabold text-sm text-[#171e19] uppercase tracking-wider">
                {tr("bento_who_title")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/signup"
                  className="p-4 bg-[#ffe17c] hover:bg-[#ffd94a] border-2 border-[#171e19] no-underline block transition-all"
                  style={{ boxShadow: "2px 2px 0px #171e19" }}
                >
                  <div className="text-xs font-extrabold text-[#171e19] flex items-center justify-between uppercase">
                    <span>Citizens</span>
                    <ArrowRight size={14} strokeWidth={3} />
                  </div>
                  <p className="text-[11px] text-[#171e19]/65 mt-1 font-medium">
                    Report local issues and vote on community priorities.
                  </p>
                </Link>

                <Link
                  href="/signup"
                  className="p-4 bg-[#b7c6c2] hover:bg-[#a5b8b3] border-2 border-[#171e19] no-underline block transition-all"
                  style={{ boxShadow: "2px 2px 0px #171e19" }}
                >
                  <div className="text-xs font-extrabold text-[#171e19] flex items-center justify-between uppercase">
                    <span>Universities</span>
                    <ArrowRight size={14} strokeWidth={3} />
                  </div>
                  <p className="text-[11px] text-[#171e19]/65 mt-1 font-medium">
                    Bridge campus research with real-world municipal needs.
                  </p>
                </Link>

                <Link
                  href="/signup"
                  className="p-4 bg-white hover:bg-[#faf9f6] border-2 border-[#171e19] no-underline block transition-all"
                  style={{ boxShadow: "2px 2px 0px #171e19" }}
                >
                  <div className="text-xs font-extrabold text-[#171e19] flex items-center justify-between uppercase">
                    <span>Industry & CSR</span>
                    <ArrowRight size={14} strokeWidth={3} />
                  </div>
                  <p className="text-[11px] text-[#171e19]/65 mt-1 font-medium">
                    Deploy capital and equipment with transparent impact tracking.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.3 HOW IT WORKS / USER FLOW — Neo-Brutalist flow cards
      ───────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-[3px] border-[#171e19] bg-white">
        {/* Soft Organic Morphing Shape in background */}
        <div className="absolute -bottom-28 right-0 w-[480px] h-[480px] opacity-30 pointer-events-none z-0 hidden md:block">
          <MorphingShape className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-block">
              <span className={`${lang === "hi" ? "eyebrow-hi" : "eyebrow-en"} text-[#171e19] bg-[#ffe17c] px-3 py-1 border-2 border-[#171e19] inline-block`} style={{ boxShadow: "2px 2px 0px #171e19" }}>
                Workflow & Governance
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#171e19] uppercase tracking-tight">
              {tr("flow_title")}
            </h2>
            <p className="text-sm sm:text-base text-[#171e19]/60 font-medium">
              {tr("flow_subtitle")}
            </p>
          </div>

          {/* Interactive Flow Grid with 5 Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1: Citizen Submits */}
            <div className="p-5 bg-[#ffe17c] border-[3px] border-[#171e19] space-y-3 flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #171e19" }}>
              <div>
                <span className="text-[11px] font-extrabold text-[#171e19] uppercase tracking-[0.15em] block mb-2">
                  Step 1
                </span>
                <div className="w-10 h-10 bg-white text-[#171e19] border-2 border-[#171e19] flex items-center justify-center mb-3" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <User size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase">
                  {tr("flow_step1_title")}
                </h3>
                <p className="text-xs text-[#171e19]/60 leading-relaxed mt-1 font-medium">
                  {tr("flow_step1_desc")}
                </p>
              </div>
              <span className="badge status-open text-[11px] w-fit">Pending Review</span>
            </div>

            {/* Gate 1: Admin Approval */}
            <div className="p-5 bg-white border-[3px] border-[#e07a24] space-y-3 flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #e07a24" }}>
              <div>
                <span className="text-[11px] font-extrabold text-[#e07a24] uppercase tracking-[0.15em] block mb-2">
                  Gate 1
                </span>
                <div className="w-10 h-10 bg-[#e07a24] text-white border-2 border-[#171e19] flex items-center justify-center mb-3" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase">
                  {tr("flow_gate1_title")}
                </h3>
                <p className="text-xs text-[#171e19]/60 leading-relaxed mt-1 font-medium">
                  {tr("flow_gate1_desc")}
                </p>
              </div>
              <span className="badge status-approved text-[11px] w-fit">Public Feed Gate</span>
            </div>

            {/* Step 2: University Proposes */}
            <div className="p-5 bg-[#b7c6c2] border-[3px] border-[#171e19] space-y-3 flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #171e19" }}>
              <div>
                <span className="text-[11px] font-extrabold text-[#171e19] uppercase tracking-[0.15em] block mb-2">
                  Step 2
                </span>
                <div className="w-10 h-10 bg-white text-[#171e19] border-2 border-[#171e19] flex items-center justify-center mb-3" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <GraduationCap size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase">
                  {tr("flow_step2_title")}
                </h3>
                <p className="text-xs text-[#171e19]/60 leading-relaxed mt-1 font-medium">
                  {tr("flow_step2_desc")}
                </p>
              </div>
              <span className="badge status-solution text-[11px] w-fit">Solution Proposed</span>
            </div>

            {/* Step 3: Industry Partners */}
            <div className="p-5 bg-[#faf9f6] border-[3px] border-[#171e19] space-y-3 flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #171e19" }}>
              <div>
                <span className="text-[11px] font-extrabold text-[#171e19] uppercase tracking-[0.15em] block mb-2">
                  Step 3
                </span>
                <div className="w-10 h-10 bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] flex items-center justify-center mb-3" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <Building2 size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase">
                  {tr("flow_step3_title")}
                </h3>
                <p className="text-xs text-[#171e19]/60 leading-relaxed mt-1 font-medium">
                  {tr("flow_step3_desc")}
                </p>
              </div>
              <span className="badge status-pending text-[11px] w-fit">Proposal Offered</span>
            </div>

            {/* Gate 2: Admin Approval of Partnership */}
            <div className="p-5 bg-[#d8f3dc] border-[3px] border-[#2d6a4f] space-y-3 flex flex-col justify-between" style={{ boxShadow: "4px 4px 0px #2d6a4f" }}>
              <div>
                <span className="text-[11px] font-extrabold text-[#2d6a4f] uppercase tracking-[0.15em] block mb-2">
                  Gate 2
                </span>
                <div className="w-10 h-10 bg-[#2d6a4f] text-white border-2 border-[#171e19] flex items-center justify-center mb-3" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <Handshake size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#171e19] uppercase">
                  {tr("flow_gate2_title")}
                </h3>
                <p className="text-xs text-[#171e19]/60 leading-relaxed mt-1 font-medium">
                  {tr("flow_gate2_desc")}
                </p>
              </div>
              <span className="badge status-approved text-[11px] w-fit">Deployment Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.4 BROWSE SECTION — Brutalist search & tabs
      ───────────────────────────────────────────────────────────────────── */}
      <main id="browse-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 space-y-8 w-full">
        {/* Search & Category Chips */}
        <div className="bg-white p-6 border-[3px] border-[#171e19] space-y-5" style={{ boxShadow: "4px 4px 0px #171e19" }}>
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171e19]/50 w-4.5 h-4.5" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder={tr("search_placeholder")}
                className="input pl-11"
              />
            </div>
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <button type="submit" className="btn-primary text-sm py-2.5 px-6">
              {tr("search_btn")}
            </button>
          </form>

          {/* Category Chips: Lucide icons, full labels, horizontal scroll on mobile */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#171e19]/50">
              {tr("filter_label")}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href={`/?tab=${activeTab}${
                  searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                }#browse-section`}
                className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-all no-underline border-2 border-[#171e19] uppercase tracking-wider ${
                  !selectedCategory
                    ? "bg-[#171e19] text-[#ffe17c]"
                    : "bg-white text-[#171e19] hover:bg-[#ffe17c]"
                }`}
                style={{ boxShadow: !selectedCategory ? "none" : "1px 1px 0px #171e19" }}
              >
                {tr("filter_all")}
              </Link>

              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={cat.value}
                    href={`/?tab=${activeTab}&category=${cat.value}${
                      searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                    }#browse-section`}
                    className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all no-underline border-2 border-[#171e19] uppercase ${
                      isSelected
                        ? "bg-[#2d6a4f] text-white"
                        : "bg-white text-[#171e19] hover:bg-[#ffe17c]"
                    }`}
                    style={{ boxShadow: isSelected ? "none" : "1px 1px 0px #171e19" }}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation — Brutalist underlined tabs */}
        <div className="flex border-b-[3px] border-[#171e19] bg-white px-6 pt-2 gap-8 overflow-x-auto scrollbar-none">
          <Link
            href={`/?tab=problems${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}#browse-section`}
            className={`py-3.5 text-sm font-extrabold border-b-[3px] flex items-center gap-2 transition-colors whitespace-nowrap no-underline uppercase tracking-wider ${
              activeTab === "problems"
                ? "border-[#ffe17c] text-[#171e19] bg-[#ffe17c]/20"
                : "border-transparent text-[#171e19]/50 hover:text-[#171e19]"
            }`}
          >
            <MapPin size={16} />
            <span>
              {tr("tab_problems")} ({problems.length})
            </span>
          </Link>

          <Link
            href={`/?tab=solutions${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}#browse-section`}
            className={`py-3.5 text-sm font-extrabold border-b-[3px] flex items-center gap-2 transition-colors whitespace-nowrap no-underline uppercase tracking-wider ${
              activeTab === "solutions"
                ? "border-[#ffe17c] text-[#171e19] bg-[#ffe17c]/20"
                : "border-transparent text-[#171e19]/50 hover:text-[#171e19]"
            }`}
          >
            <Lightbulb size={16} />
            <span>
              {tr("tab_solutions")} ({solutions.length})
            </span>
          </Link>

          <Link
            href={`/?tab=partnerships${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}#browse-section`}
            className={`py-3.5 text-sm font-extrabold border-b-[3px] flex items-center gap-2 transition-colors whitespace-nowrap no-underline uppercase tracking-wider ${
              activeTab === "partnerships"
                ? "border-[#ffe17c] text-[#171e19] bg-[#ffe17c]/20"
                : "border-transparent text-[#171e19]/50 hover:text-[#171e19]"
            }`}
          >
            <Handshake size={16} />
            <span>
              {tr("tab_partnerships")} ({partnerships.length})
            </span>
          </Link>
        </div>

        {/* Tab 1: Problems Feed */}
        {activeTab === "problems" && (
          <div>
            {problems.length === 0 ? (
              <div className="card text-center py-16 text-[#171e19]/60 space-y-3">
                <MapPin className="w-12 h-12 mx-auto text-[#b7c6c2]" />
                <h3 className="font-extrabold text-lg text-[#171e19] uppercase">
                  {tr("empty_problems_title")}
                </h3>
                <p className="text-sm text-[#171e19]/50 max-w-md mx-auto font-medium">
                  {tr("empty_problems_sub")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map((p) => (
                  <ProblemCard key={p.id} problem={p} href={`/problems/${p.id}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Solutions Feed */}
        {activeTab === "solutions" && (
          <div>
            {solutions.length === 0 ? (
              <div className="card text-center py-16 text-[#171e19]/60 space-y-3">
                <Lightbulb className="w-12 h-12 mx-auto text-[#b7c6c2]" />
                <h3 className="font-extrabold text-lg text-[#171e19] uppercase">
                  {tr("empty_solutions_title")}
                </h3>
                <p className="text-sm text-[#171e19]/50 max-w-md mx-auto font-medium">
                  {tr("empty_solutions_sub")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {solutions.map((sol) => (
                  <div key={sol.id} className="card card-hover flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="badge bg-[#b7c6c2] text-[#171e19] border-[#171e19]">
                          <GraduationCap size={13} />
                          <span>{sol.university.name}</span>
                        </span>
                        <span className="text-xs text-[#171e19]/50 font-bold">
                          {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h2 className="font-extrabold text-lg text-[#171e19] leading-snug uppercase">
                        {sol.title}
                      </h2>

                      <div className="bg-[#faf9f6] p-3 border-2 border-[#171e19]/15 text-xs text-[#171e19]/60 font-medium">
                        <span className="font-bold text-[#171e19]">
                          {tr("card_problem_label")}
                        </span>{" "}
                        {sol.problem.title}{" "}
                        <span className="text-[#171e19]/50">({sol.problem.location})</span>
                      </div>

                      <p className="text-sm text-[#171e19]/60 line-clamp-3 leading-relaxed font-medium">
                        {sol.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t-2 border-[#171e19]/15 flex items-center justify-between">
                      <span className="text-xs text-[#171e19]/60 flex items-center gap-1 font-bold">
                        <Handshake size={14} className="text-[#2d6a4f]" />
                        <span>
                          {sol._count.partnerships}{" "}
                          {sol._count.partnerships !== 1
                            ? tr("card_partnership_proposals_plural")
                            : tr("card_partnership_proposals")}
                        </span>
                      </span>
                      <Link
                        href={`/solutions/${sol.id}`}
                        className="btn-outline text-xs py-1.5 px-3.5 no-underline"
                      >
                        {tr("card_view_details")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Partnerships Feed (Public Approved Only) */}
        {activeTab === "partnerships" && (
          <div>
            {partnerships.length === 0 ? (
              <div className="card text-center py-16 text-[#171e19]/60 space-y-3">
                <Handshake className="w-12 h-12 mx-auto text-[#b7c6c2]" />
                <h3 className="font-extrabold text-lg text-[#171e19] uppercase">
                  {tr("empty_partnerships_title")}
                </h3>
                <p className="text-sm text-[#171e19]/50 max-w-md mx-auto font-medium">
                  {tr("empty_partnerships_sub")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partnerships.map((p) => (
                  <div key={p.id} className="card card-hover space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Link
                          href={`/industry/${p.industry.id}`}
                          className="badge bg-[#ffe17c] text-[#171e19] border-[#171e19] hover:bg-[#ffd94a] transition-colors no-underline inline-flex items-center gap-1.5"
                        >
                          <Building2 size={13} />
                          <span>
                            {p.industry.name} {tr("card_industry_suffix")}
                          </span>
                        </Link>
                        <StatusPill status={p.status} />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-[#171e19] uppercase">
                          {p.solution.title}
                        </h3>
                        <p className="text-xs text-[#171e19]/50 mt-1 font-medium">
                          {tr("card_university_label")}{" "}
                          <span className="font-bold text-[#171e19]">
                            {p.solution.university.name}
                          </span>{" "}
                          • {tr("card_problem_card_label")}{" "}
                          <span className="font-bold text-[#171e19]">
                            {p.solution.problem.title}
                          </span>
                        </p>
                      </div>

                      <p className="text-sm text-[#171e19]/60 line-clamp-3 bg-[#faf9f6] p-3.5 border-2 border-[#171e19]/15 leading-relaxed font-medium">
                        {p.proposalDetails}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end border-t-2 border-[#171e19]/15">
                      <Link
                        href={`/solutions/${p.solution.id}`}
                        className="btn-outline text-xs py-1.5 px-3.5 no-underline"
                      >
                        {tr("card_view_solution")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────────
          JOIN SECTION (3 Roles) — Neo-Brutalist stacked cards
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t-[3px] border-[#171e19] bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171e19] uppercase tracking-tight">
              {tr("join_heading")}
            </h2>
            <p className="text-sm text-[#171e19]/60 font-medium">{tr("join_subtext")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Citizen Card */}
            <div className="card space-y-4 flex flex-col justify-between bg-[#ffe17c]" style={{ boxShadow: "5px 5px 0px #171e19" }}>
              <div className="space-y-3">
                <div className="w-11 h-11 bg-white text-[#171e19] border-2 border-[#171e19] flex items-center justify-center" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <User size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-[#171e19] uppercase">Citizens</h3>
                <p className="text-xs sm:text-sm text-[#171e19]/65 leading-relaxed font-medium">
                  Spot an issue in your area? Submit a verified problem report with location and photos to bring institutional focus.
                </p>
              </div>
              <Link
                href="/signup"
                className="btn-secondary text-xs font-extrabold py-2.5 px-4 w-full text-center no-underline"
              >
                Join as Citizen →
              </Link>
            </div>

            {/* University Card */}
            <div className="card space-y-4 flex flex-col justify-between bg-[#b7c6c2]" style={{ boxShadow: "5px 5px 0px #171e19" }}>
              <div className="space-y-3">
                <div className="w-11 h-11 bg-white text-[#171e19] border-2 border-[#171e19] flex items-center justify-center" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <GraduationCap size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-[#171e19] uppercase">Universities</h3>
                <p className="text-xs sm:text-sm text-[#171e19]/65 leading-relaxed font-medium">
                  Apply faculty R&D and student innovation to genuine local challenges, earning recognition and grant collaboration.
                </p>
              </div>
              <Link
                href="/signup"
                className="btn-secondary text-xs font-extrabold py-2.5 px-4 w-full text-center no-underline"
              >
                Join as University →
              </Link>
            </div>

            {/* Industry Card */}
            <div className="card space-y-4 flex flex-col justify-between bg-white" style={{ boxShadow: "5px 5px 0px #171e19" }}>
              <div className="space-y-3">
                <div className="w-11 h-11 bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] flex items-center justify-center" style={{ boxShadow: "2px 2px 0px #171e19" }}>
                  <Building2 size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-[#171e19] uppercase">Industry & CSR</h3>
                <p className="text-xs sm:text-sm text-[#171e19]/65 leading-relaxed font-medium">
                  Direct mandatory CSR funds to validated municipal solutions with end-to-end transparent impact reporting.
                </p>
              </div>
              <Link
                href="/signup"
                className="btn-secondary text-xs font-extrabold py-2.5 px-4 w-full text-center no-underline"
              >
                Join as Industry Partner →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.5 FOOTER — Neo-Brutalist: Deep charcoal with yellow accents
      ───────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#171e19] text-[#faf9f6] py-14 px-4 sm:px-6 lg:px-8 mt-auto border-t-[4px] border-[#ffe17c]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-white/10 pb-8">
            <BrandLogo size="md" isWhiteText={true} href="/" />

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#faf9f6]/70 font-bold uppercase tracking-wider">
              <Link href="/problems" className="hover:text-[#ffe17c] transition-colors">
                {tr("nav_problems")}
              </Link>
              <Link href="/solutions" className="hover:text-[#ffe17c] transition-colors">
                {tr("nav_solutions")}
              </Link>
              <Link href="/partnerships" className="hover:text-[#ffe17c] transition-colors">
                {tr("nav_partnerships")}
              </Link>
              <Link href="#how-it-works" className="hover:text-[#ffe17c] transition-colors">
                {tr("footer_about")}
              </Link>
              <span className="text-[#ffe17c]/30">|</span>
              <a href="mailto:support@jansamadhan.gov.in" className="hover:text-[#ffe17c] transition-colors">
                {tr("footer_contact")}
              </a>
              <a href="#" className="hover:text-[#ffe17c] transition-colors">
                {tr("footer_privacy")}
              </a>
              <a href="#" className="hover:text-[#ffe17c] transition-colors">
                {tr("footer_terms")}
              </a>
              <a href="#" className="hover:text-[#ffe17c] transition-colors">
                {tr("footer_accessibility")}
              </a>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#b7c6c2] gap-2 font-medium">
            <p>{tr("footer_tagline")}</p>
            <p>© {new Date().getFullYear()} JanSamadhan. {tr("footer_rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
