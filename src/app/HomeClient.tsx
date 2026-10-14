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
    <div className="min-h-screen bg-[#FAF7F0] text-[#1C1B18] flex flex-col">
      {/* ─────────────────────────────────────────────────────────────────────
          4.1 HERO SECTION (Left-aligned, 2 columns, Saffron underline)
      ───────────────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#E5DFD0] py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow: 12px uppercase for EN, normal for Hindi */}
            <div className={lang === "hi" ? "eyebrow-hi text-[#2E7D4F]" : "eyebrow-en text-[#2E7D4F]"}>
              {tr("hero_eyebrow")}
            </div>

            {/* H1 Heading with Saffron hand-drawn SVG underline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[42px] font-semibold text-[#17254A] leading-[1.2] tracking-tight">
              <span>Connecting citizens, universities and </span>
              <span className="relative inline-block whitespace-nowrap">
                industry
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 overflow-visible pointer-events-none"
                  viewBox="0 0 160 12"
                  fill="none"
                >
                  <motion.path
                    d="M 2 8 C 45 2, 115 11, 158 5"
                    stroke="#D98324"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
              </span>
              <span> to solve local challenges.</span>
            </h1>

            {/* Short subcopy */}
            <p className="text-base sm:text-lg text-[#5E5C54] max-w-2xl leading-relaxed">
              {tr("hero_subtext")}
            </p>

            {/* Two CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/citizen/problems/new"
                className="btn-primary text-sm font-semibold px-6 py-3 no-underline shadow-sm"
              >
                <span>{tr("hero_cta_report")}</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/#browse-section"
                className="btn-outline text-sm font-semibold px-6 py-3 no-underline"
              >
                {tr("hero_cta_browse")}
              </Link>
            </div>

            {/* Three Trust Ticks */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#5E5C54] font-medium border-t border-[#E5DFD0]/70">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#2E7D4F]" />
                <span>{tr("hero_trust_free")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#2E7D4F]" />
                <span>{tr("hero_trust_verified")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#2E7D4F]" />
                <span>{tr("hero_trust_transparent")}</span>
              </div>
            </div>
          </div>

          {/* Right Column (Span 5): Journey Visual */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E5DFD0] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
                <span className="text-xs font-semibold text-[#17254A] uppercase tracking-wider">
                  Civic Collaboration Journey
                </span>
                <span className="badge bg-[#F1ECDF] text-[#17254A] border-[#CBC3AE]">
                  {isRealChain ? "Live Chain" : "Example Journey"}
                </span>
              </div>

              {/* Step 1: Citizen reports */}
              <div className="relative pl-8 pb-4">
                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#E3F0E7] text-[#2E7D4F] border border-[#2E7D4F] flex items-center justify-center">
                  <User size={13} />
                </div>
                {/* Connector line */}
                <div className="absolute left-3 top-7 bottom-0 w-[2px] bg-[#E5DFD0]" />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2E7D4F]">1. Citizen Reports</span>
                    <span className="text-[11px] text-[#5E5C54]">{chainData.location}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1C1B18] line-clamp-1">
                    {chainData.title}
                  </h4>
                  <p className="text-xs text-[#5E5C54]">Reported by {chainData.postedBy.name}</p>
                </div>
              </div>

              {/* Step 2: University proposes */}
              <div className="relative pl-8 pb-4">
                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#E4E9F5] text-[#17254A] border border-[#17254A] flex items-center justify-center">
                  <GraduationCap size={13} />
                </div>
                {/* Connector line */}
                <div className="absolute left-3 top-7 bottom-0 w-[2px] bg-[#E5DFD0]" />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#17254A]">2. University Proposes</span>
                    <span className="text-[11px] text-[#5E5C54]">Research & Tech</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1C1B18] line-clamp-1">
                    {chainData.solutions[0]?.title || "Technical Feasibility Study"}
                  </h4>
                  <p className="text-xs text-[#5E5C54]">
                    Lead: {chainData.solutions[0]?.university.name || "University Partner"}
                  </p>
                </div>
              </div>

              {/* Step 3: Industry backs */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#FBEBD3] text-[#98590A] border border-[#D98324] flex items-center justify-center">
                  <Building2 size={13} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#98590A]">3. Industry Backs</span>
                    <span className="badge status-approved text-[10px] py-0.5">Approved</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1C1B18] line-clamp-1">
                    {chainData.solutions[0]?.partnerships[0]?.industry.name || "Corporate CSR Deployment"}
                  </h4>
                  <p className="text-xs text-[#5E5C54]">Sponsorship & Resource Deployment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.2 LIVE IMPACT BENTO GRID
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E5DFD0] bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className={lang === "hi" ? "eyebrow-hi text-[#2E7D4F]" : "eyebrow-en text-[#2E7D4F]"}>
                {tr("bento_live_stats")}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#17254A]">
                Measurable Impact Across Communities
              </h2>
            </div>
            <Link
              href="#how-it-works"
              className="text-xs font-semibold text-[#2E7D4F] hover:text-[#22633D] inline-flex items-center gap-1"
            >
              <span>Learn how verified review gates work</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* 12-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Tile A (span 5, 2 rows): Problems reported with dynamic counter & latest problem link */}
            <div className="lg:col-span-5 lg:row-span-2 bento-tile flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#E3F0E7] text-[#2E7D4F] flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-[#17254A]">
                  <DynamicCounter value={problemCount} />
                </div>
                <h3 className="font-semibold text-base text-[#1C1B18]">
                  {tr("metric_problems")}
                </h3>
                <p className="text-xs text-[#5E5C54] leading-relaxed">
                  Verified civic issues submitted by citizens across urban and rural wards, prioritized by community votes.
                </p>
              </div>

              {problems[0] && (
                <div className="pt-4 border-t border-[#E5DFD0] space-y-1">
                  <div className="text-[11px] font-semibold text-[#5E5C54] uppercase tracking-wider">
                    {tr("bento_latest_report")}
                  </div>
                  <Link
                    href={`/problems/${problems[0].id}`}
                    className="text-sm font-semibold text-[#17254A] hover:text-[#2E7D4F] line-clamp-1 block transition-colors"
                  >
                    {problems[0].title}
                  </Link>
                  <span className="text-[11px] text-[#5E5C54]">{problems[0].location}</span>
                </div>
              )}
            </div>

            {/* Tile B (span 4): Solutions Proposed (Flat Navy emphasis tile) */}
            <div className="lg:col-span-4 bento-tile bg-[#17254A] text-white border-[#17254A] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Lightbulb size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  <DynamicCounter value={solutionCount} />
                </div>
                <h3 className="font-semibold text-base text-white">
                  {tr("metric_solutions")}
                </h3>
              </div>
              <p className="text-xs text-[#E4E9F5]/80 pt-2 leading-relaxed">
                Applied research, prototypes, and engineering solutions designed by university faculties and research scholars.
              </p>
            </div>

            {/* Tile C (span 3): Partnerships Formed (Flat Soft Green emphasis tile) */}
            <div className="lg:col-span-3 bento-tile bg-[#E3F0E7] border-[#2E7D4F]/30 text-[#17254A] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-full bg-[#2E7D4F] text-white flex items-center justify-center">
                  <Handshake size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#2E7D4F]">
                  <DynamicCounter value={partnershipCount} />
                </div>
                <h3 className="font-semibold text-base text-[#17254A]">
                  {tr("metric_partnerships")}
                </h3>
              </div>
              <p className="text-xs text-[#5E5C54] pt-2 leading-relaxed">
                Approved CSR partnerships backing civic solutions with deployment resources.
              </p>
            </div>

            {/* Tile D (span 7): How it Works in 3 Compact Steps */}
            <div className="lg:col-span-7 bento-tile space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-[#17254A]">
                  {tr("bento_how_title")}
                </h3>
                <Link
                  href="#how-it-works"
                  className="text-xs font-semibold text-[#2E7D4F] hover:underline"
                >
                  View diagram →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DFD0] space-y-1">
                  <div className="text-xs font-bold text-[#2E7D4F]">{tr("bento_how_step1")}</div>
                  <div className="text-[11px] text-[#5E5C54]">Submit issues with photos & GPS.</div>
                </div>
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DFD0] space-y-1">
                  <div className="text-xs font-bold text-[#17254A]">{tr("bento_how_step2")}</div>
                  <div className="text-[11px] text-[#5E5C54]">Universities submit actionable R&D.</div>
                </div>
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DFD0] space-y-1">
                  <div className="text-xs font-bold text-[#D98324]">{tr("bento_how_step3")}</div>
                  <div className="text-[11px] text-[#5E5C54]">CSR partners fund and scale.</div>
                </div>
              </div>
            </div>

            {/* Tile E (span 5): 10 Categories with Live Counts */}
            <div className="lg:col-span-5 bento-tile space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-[#17254A]">
                  {tr("bento_categories_title")}
                </h3>
                <span className="text-[11px] text-[#5E5C54]">10 Active Domains</span>
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
                      className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F1ECDF] border border-[#E5DFD0] flex flex-col items-center justify-center text-center transition-colors group no-underline"
                    >
                      <Icon className="w-4 h-4 text-[#17254A] group-hover:text-[#2E7D4F] transition-colors mb-1" />
                      <span className="text-[10px] font-bold text-[#17254A] leading-none">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tile F (span 4): Impact highlight */}
            <div className="lg:col-span-4 bento-tile space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D98324]">
                <Sparkles size={14} />
                <span>{tr("bento_impact_title")}</span>
              </div>
              <h4 className="font-semibold text-sm text-[#1C1B18]">
                Institutional Civic Bridge
              </h4>
              <p className="text-xs text-[#5E5C54] leading-relaxed">
                {tr("bento_impact_desc")}
              </p>
            </div>

            {/* Tile G (span 8): Who it's for with links */}
            <div className="lg:col-span-8 bento-tile space-y-3">
              <h3 className="font-semibold text-sm text-[#17254A]">
                {tr("bento_who_title")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/signup"
                  className="p-3 bg-[#FAF7F0] hover:bg-[#FFFFFF] border border-[#E5DFD0] rounded-xl no-underline block transition-all"
                >
                  <div className="text-xs font-bold text-[#17254A] flex items-center justify-between">
                    <span>Citizens</span>
                    <ArrowRight size={12} />
                  </div>
                  <p className="text-[11px] text-[#5E5C54] mt-1">
                    Report local issues and vote on community priorities.
                  </p>
                </Link>

                <Link
                  href="/signup"
                  className="p-3 bg-[#FAF7F0] hover:bg-[#FFFFFF] border border-[#E5DFD0] rounded-xl no-underline block transition-all"
                >
                  <div className="text-xs font-bold text-[#17254A] flex items-center justify-between">
                    <span>Universities</span>
                    <ArrowRight size={12} />
                  </div>
                  <p className="text-[11px] text-[#5E5C54] mt-1">
                    Bridge campus research with real-world municipal needs.
                  </p>
                </Link>

                <Link
                  href="/signup"
                  className="p-3 bg-[#FAF7F0] hover:bg-[#FFFFFF] border border-[#E5DFD0] rounded-xl no-underline block transition-all"
                >
                  <div className="text-xs font-bold text-[#17254A] flex items-center justify-between">
                    <span>Industry & CSR</span>
                    <ArrowRight size={12} />
                  </div>
                  <p className="text-[11px] text-[#5E5C54] mt-1">
                    Deploy capital and equipment with transparent impact tracking.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.3 HOW IT WORKS / USER FLOW (Native HTML/SVG with approval gates)
      ───────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E5DFD0] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className={lang === "hi" ? "eyebrow-hi text-[#2E7D4F]" : "eyebrow-en text-[#2E7D4F]"}>
              Workflow & Governance
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#17254A]">
              {tr("flow_title")}
            </h2>
            <p className="text-sm sm:text-base text-[#5E5C54]">
              {tr("flow_subtitle")}
            </p>
          </div>

          {/* Interactive Flow Grid with 5 Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1: Citizen Submits */}
            <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD0] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#2E7D4F] uppercase tracking-wider block mb-1">
                  Step 1
                </span>
                <div className="w-9 h-9 rounded-full bg-[#E3F0E7] text-[#2E7D4F] flex items-center justify-center mb-3">
                  <User size={18} />
                </div>
                <h3 className="font-semibold text-base text-[#1C1B18]">
                  {tr("flow_step1_title")}
                </h3>
                <p className="text-xs text-[#5E5C54] leading-relaxed mt-1">
                  {tr("flow_step1_desc")}
                </p>
              </div>
              <span className="badge status-open text-[11px] w-fit">Pending Review</span>
            </div>

            {/* Gate 1: Admin Approval */}
            <div className="p-5 rounded-2xl bg-[#FBEBD3]/50 border border-[#D98324]/40 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#98590A] uppercase tracking-wider block mb-1">
                  Gate 1
                </span>
                <div className="w-9 h-9 rounded-full bg-[#D98324] text-white flex items-center justify-center mb-3">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-semibold text-base text-[#17254A]">
                  {tr("flow_gate1_title")}
                </h3>
                <p className="text-xs text-[#5E5C54] leading-relaxed mt-1">
                  {tr("flow_gate1_desc")}
                </p>
              </div>
              <span className="badge status-approved text-[11px] w-fit">Public Feed Gate</span>
            </div>

            {/* Step 2: University Proposes */}
            <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD0] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#17254A] uppercase tracking-wider block mb-1">
                  Step 2
                </span>
                <div className="w-9 h-9 rounded-full bg-[#E4E9F5] text-[#17254A] flex items-center justify-center mb-3">
                  <GraduationCap size={18} />
                </div>
                <h3 className="font-semibold text-base text-[#1C1B18]">
                  {tr("flow_step2_title")}
                </h3>
                <p className="text-xs text-[#5E5C54] leading-relaxed mt-1">
                  {tr("flow_step2_desc")}
                </p>
              </div>
              <span className="badge status-solution text-[11px] w-fit">Solution Proposed</span>
            </div>

            {/* Step 3: Industry Partners */}
            <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD0] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#98590A] uppercase tracking-wider block mb-1">
                  Step 3
                </span>
                <div className="w-9 h-9 rounded-full bg-[#FBEBD3] text-[#98590A] flex items-center justify-center mb-3">
                  <Building2 size={18} />
                </div>
                <h3 className="font-semibold text-base text-[#1C1B18]">
                  {tr("flow_step3_title")}
                </h3>
                <p className="text-xs text-[#5E5C54] leading-relaxed mt-1">
                  {tr("flow_step3_desc")}
                </p>
              </div>
              <span className="badge status-pending text-[11px] w-fit">Proposal Offered</span>
            </div>

            {/* Gate 2: Admin Approval of Partnership */}
            <div className="p-5 rounded-2xl bg-[#E3F0E7]/60 border border-[#2E7D4F]/40 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#2E7D4F] uppercase tracking-wider block mb-1">
                  Gate 2
                </span>
                <div className="w-9 h-9 rounded-full bg-[#2E7D4F] text-white flex items-center justify-center mb-3">
                  <Handshake size={18} />
                </div>
                <h3 className="font-semibold text-base text-[#17254A]">
                  {tr("flow_gate2_title")}
                </h3>
                <p className="text-xs text-[#5E5C54] leading-relaxed mt-1">
                  {tr("flow_gate2_desc")}
                </p>
              </div>
              <span className="badge status-approved text-[11px] w-fit">Deployment Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.4 BROWSE SECTION (Search, Category horizontal scroll, Single green underline tab)
      ───────────────────────────────────────────────────────────────────── */}
      <main id="browse-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8 w-full">
        {/* Search & Category Chips */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5DFD0] space-y-5">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5E5C54] w-4.5 h-4.5" />
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
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5C54]">
              {tr("filter_label")}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href={`/?tab=${activeTab}${
                  searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                }#browse-section`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors no-underline border ${
                  !selectedCategory
                    ? "bg-[#17254A] text-[#FFFFFF] border-[#17254A]"
                    : "bg-[#FFFFFF] text-[#5E5C54] border-[#E5DFD0] hover:bg-[#FAF7F0] hover:text-[#1C1B18]"
                }`}
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
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors no-underline border ${
                      isSelected
                        ? "bg-[#2E7D4F] text-[#FFFFFF] border-[#2E7D4F]"
                        : "bg-[#FFFFFF] text-[#1C1B18] border-[#E5DFD0] hover:bg-[#FAF7F0] hover:border-[#CBC3AE]"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation: Single green (#2E7D4F) underline for active tab */}
        <div className="flex border-b border-[#E5DFD0] bg-[#FFFFFF] rounded-t-2xl px-6 pt-2 gap-8 overflow-x-auto scrollbar-none">
          <Link
            href={`/?tab=problems${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}#browse-section`}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap no-underline ${
              activeTab === "problems"
                ? "border-[#2E7D4F] text-[#2E7D4F]"
                : "border-transparent text-[#5E5C54] hover:text-[#1C1B18]"
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
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap no-underline ${
              activeTab === "solutions"
                ? "border-[#2E7D4F] text-[#2E7D4F]"
                : "border-transparent text-[#5E5C54] hover:text-[#1C1B18]"
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
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap no-underline ${
              activeTab === "partnerships"
                ? "border-[#2E7D4F] text-[#2E7D4F]"
                : "border-transparent text-[#5E5C54] hover:text-[#1C1B18]"
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
              <div className="card text-center py-16 text-[#5E5C54] space-y-3">
                <MapPin className="w-12 h-12 mx-auto text-[#CBC3AE]" />
                <h3 className="font-semibold text-lg text-[#1C1B18]">
                  {tr("empty_problems_title")}
                </h3>
                <p className="text-sm text-[#5E5C54] max-w-md mx-auto">
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
              <div className="card text-center py-16 text-[#5E5C54] space-y-3">
                <Lightbulb className="w-12 h-12 mx-auto text-[#CBC3AE]" />
                <h3 className="font-semibold text-lg text-[#1C1B18]">
                  {tr("empty_solutions_title")}
                </h3>
                <p className="text-sm text-[#5E5C54] max-w-md mx-auto">
                  {tr("empty_solutions_sub")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {solutions.map((sol) => (
                  <div key={sol.id} className="card card-hover flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="badge bg-[#E4E9F5] text-[#17254A] border-[#17254A]/30">
                          <GraduationCap size={13} />
                          <span>{sol.university.name}</span>
                        </span>
                        <span className="text-xs text-[#5E5C54]">
                          {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h2 className="font-semibold text-lg text-[#1C1B18] leading-snug">
                        {sol.title}
                      </h2>

                      <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E5DFD0] text-xs text-[#5E5C54]">
                        <span className="font-semibold text-[#1C1B18]">
                          {tr("card_problem_label")}
                        </span>{" "}
                        {sol.problem.title}{" "}
                        <span className="text-[#5E5C54]">({sol.problem.location})</span>
                      </div>

                      <p className="text-sm text-[#5E5C54] line-clamp-3 leading-relaxed">
                        {sol.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between">
                      <span className="text-xs text-[#5E5C54] flex items-center gap-1 font-medium">
                        <Handshake size={14} className="text-[#2E7D4F]" />
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
              <div className="card text-center py-16 text-[#5E5C54] space-y-3">
                <Handshake className="w-12 h-12 mx-auto text-[#CBC3AE]" />
                <h3 className="font-semibold text-lg text-[#1C1B18]">
                  {tr("empty_partnerships_title")}
                </h3>
                <p className="text-sm text-[#5E5C54] max-w-md mx-auto">
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
                          className="badge bg-[#FBEBD3] text-[#98590A] border-[#D98324]/40 hover:bg-[#FBEBD3]/80 transition-colors no-underline inline-flex items-center gap-1.5"
                        >
                          <Building2 size={13} />
                          <span>
                            {p.industry.name} {tr("card_industry_suffix")}
                          </span>
                        </Link>
                        <StatusPill status={p.status} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-base text-[#1C1B18]">
                          {p.solution.title}
                        </h3>
                        <p className="text-xs text-[#5E5C54] mt-1">
                          {tr("card_university_label")}{" "}
                          <span className="font-semibold text-[#1C1B18]">
                            {p.solution.university.name}
                          </span>{" "}
                          • {tr("card_problem_card_label")}{" "}
                          <span className="font-semibold text-[#1C1B18]">
                            {p.solution.problem.title}
                          </span>
                        </p>
                      </div>

                      <p className="text-sm text-[#5E5C54] line-clamp-3 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E5DFD0] leading-relaxed">
                        {p.proposalDetails}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end border-t border-[#E5DFD0]">
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
          JOIN SECTION (3 Roles)
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E5DFD0] bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#17254A]">
              {tr("join_heading")}
            </h2>
            <p className="text-sm text-[#5E5C54]">{tr("join_subtext")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Citizen Card */}
            <div className="card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E3F0E7] text-[#2E7D4F] flex items-center justify-center">
                  <User size={20} />
                </div>
                <h3 className="font-semibold text-lg text-[#1C1B18]">Citizens</h3>
                <p className="text-xs sm:text-sm text-[#5E5C54] leading-relaxed">
                  Spot an issue in your area? Submit a verified problem report with location and photos to bring institutional focus.
                </p>
              </div>
              <Link
                href="/signup"
                className="btn-outline text-xs font-semibold py-2.5 px-4 w-full text-center"
              >
                Join as Citizen →
              </Link>
            </div>

            {/* University Card */}
            <div className="card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E4E9F5] text-[#17254A] flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <h3 className="font-semibold text-lg text-[#1C1B18]">Universities</h3>
                <p className="text-xs sm:text-sm text-[#5E5C54] leading-relaxed">
                  Apply faculty R&D and student innovation to genuine local challenges, earning recognition and grant collaboration.
                </p>
              </div>
              <Link
                href="/signup"
                className="btn-outline text-xs font-semibold py-2.5 px-4 w-full text-center"
              >
                Join as University →
              </Link>
            </div>

            {/* Industry Card */}
            <div className="card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FBEBD3] text-[#98590A] flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h3 className="font-semibold text-lg text-[#1C1B18]">Industry & CSR</h3>
                <p className="text-xs sm:text-sm text-[#5E5C54] leading-relaxed">
                  Direct mandatory CSR funds to validated municipal solutions with end-to-end transparent impact reporting.
                </p>
              </div>
              <Link
                href="/signup"
                className="btn-outline text-xs font-semibold py-2.5 px-4 w-full text-center"
              >
                Join as Industry Partner →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4.5 FOOTER (Flat Navy #17254A with clean links)
      ───────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#17254A] text-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2E7D4F] text-white flex items-center justify-center">
                <Sprout className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-serif font-semibold text-lg text-white">
                  JanSamadhan
                </span>
                <span className="text-xs text-[#CBC3AE] block">जन समाधान</span>
              </div>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#E4E9F5]/90 font-medium">
              <Link href="/problems" className="hover:text-white transition-colors">
                {tr("nav_problems")}
              </Link>
              <Link href="/solutions" className="hover:text-white transition-colors">
                {tr("nav_solutions")}
              </Link>
              <Link href="/partnerships" className="hover:text-white transition-colors">
                {tr("nav_partnerships")}
              </Link>
              <Link href="#how-it-works" className="hover:text-white transition-colors">
                {tr("footer_about")}
              </Link>
              <span className="text-white/20">|</span>
              <a href="mailto:support@jansamadhan.gov.in" className="hover:text-white transition-colors">
                {tr("footer_contact")}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {tr("footer_privacy")}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {tr("footer_terms")}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {tr("footer_accessibility")}
              </a>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#CBC3AE] gap-2">
            <p>{tr("footer_tagline")}</p>
            <p>© {new Date().getFullYear()} JanSamadhan. {tr("footer_rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
