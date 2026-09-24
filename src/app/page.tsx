import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProblemCard, { StatusPill } from "@/components/problems/ProblemCard";
import { CATEGORIES } from "@/components/problems/CategoryPicker";
import {
  MapPin,
  Building2,
  Handshake,
  Lightbulb,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SearchParams {
  tab?: string;
  category?: string;
  search?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const activeTab = params.tab || "problems";
  const selectedCategory = params.category || "";
  const searchQuery = params.search || "";

  // Aggregate stats
  const [problemCount, solutionCount, partnershipCount] = await Promise.all([
    prisma.problem.count({ where: { isDeleted: false } }),
    prisma.solution.count({ where: { problem: { isDeleted: false } } }),
    prisma.partnership.count({ where: { solution: { problem: { isDeleted: false } } } }),
  ]);

  // Fetch problems feed
  const problemWhere: Record<string, unknown> = { approvalStatus: "APPROVED", isDeleted: false };
  if (selectedCategory) problemWhere.category = selectedCategory;
  if (searchQuery) {
    problemWhere.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { location: { contains: searchQuery } },
    ];
  }

  const problems = await prisma.problem.findMany({
    where: problemWhere,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      postedBy: { select: { id: true, name: true } },
      _count: { select: { solutions: true } },
    },
  });

  // Fetch solutions feed
  const solutionWhere: Record<string, unknown> = {
    problem: { approvalStatus: "APPROVED", isDeleted: false },
  };
  if (selectedCategory) {
    solutionWhere.problem = { category: selectedCategory, approvalStatus: "APPROVED", isDeleted: false };
  }
  if (searchQuery) {
    solutionWhere.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { problem: { title: { contains: searchQuery }, approvalStatus: "APPROVED", isDeleted: false } },
      { university: { name: { contains: searchQuery } } },
    ];
  }

  const solutions = await prisma.solution.findMany({
    where: solutionWhere,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      university: { select: { id: true, name: true } },
      problem: {
        select: { id: true, title: true, category: true, location: true, status: true },
      },
      _count: { select: { partnerships: true } },
    },
  });

  // Fetch partnerships feed
  const partnershipWhere: Record<string, unknown> = {
    solution: { problem: { approvalStatus: "APPROVED", isDeleted: false } },
  };
  if (selectedCategory) {
    partnershipWhere.solution = { problem: { category: selectedCategory, approvalStatus: "APPROVED" } };
  }
  if (searchQuery) {
    partnershipWhere.OR = [
      { proposalDetails: { contains: searchQuery } },
      { industry: { name: { contains: searchQuery } } },
      { solution: { title: { contains: searchQuery } } },
    ];
  }

  const partnerships = await prisma.partnership.findMany({
    where: partnershipWhere,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      industry: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      solution: {
        include: {
          university: { select: { id: true, name: true } },
          problem: { select: { id: true, title: true, category: true, location: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar role={session?.role} userName={session?.name} />

      {/* Hero Section - Light, Elegant, Rural-friendly */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-[#FAFAF9] py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-semibold text-gray-700 border border-gray-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
            <span>Civic Problem Solving & Academic Innovation Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2933] tracking-tight max-w-4xl mx-auto leading-[1.18]">
            Connecting <span className="bg-gradient-to-r from-[#14B8A6] to-[#6366F1] bg-clip-text text-transparent">Citizens</span>, Universities & Industry to Solve Local Challenges
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Report real-world community problems, collaborate with academic researchers on technical solutions, and partner with industry leaders for sustainable impact.
          </p>

          {!session && (
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <Link
                href="/signup"
                className="btn-primary text-base py-3.5 px-8 font-bold shadow-lg no-underline"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-base py-3.5 px-7 font-bold no-underline"
              >
                Log In
              </Link>
            </div>
          )}

          {session && (
            <div className="pt-4">
              <Link
                href={
                  session.role === "CITIZEN"
                    ? "/citizen/dashboard"
                    : session.role === "UNIVERSITY"
                    ? "/university/dashboard"
                    : session.role === "INDUSTRY"
                    ? "/industry/dashboard"
                    : "/admin/dashboard"
                }
                className="btn-primary text-base py-3.5 px-8 font-bold inline-flex items-center gap-2.5 no-underline"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-white border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#FAFAF9] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
                <MapPin size={20} />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{problemCount}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Civic Problems Reported
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF9] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
                <Lightbulb size={20} />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{solutionCount}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Academic Solutions Proposed
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF9] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                <Handshake size={20} />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2933]">{partnershipCount}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Industry Partnerships Formed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 w-full">
        {/* Search & Filter Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-5">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search across civic issues, university solutions, or corporate partnerships..."
                className="input pl-11"
              />
            </div>
            {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            <button type="submit" className="btn-primary text-sm py-3 px-6">
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Filter by category</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href={`/?tab=${activeTab}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all no-underline ${
                  !selectedCategory
                    ? "bg-gradient-to-r from-[#14B8A6] to-[#6366F1] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Categories
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/?tab=${activeTab}&category=${cat.value}${
                    searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                  }`}
                  style={{
                    backgroundColor: selectedCategory === cat.value ? cat.color : undefined,
                    color: selectedCategory === cat.value ? "#FFFFFF" : undefined,
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all no-underline ${
                    selectedCategory === cat.value
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-x-auto scrollbar-none">
          <Link
            href={`/?tab=problems${selectedCategory ? `&category=${selectedCategory}` : ""}${
              searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
            }`}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap no-underline ${
              activeTab === "problems"
                ? "border-[#14B8A6] text-[#0D9488]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <MapPin size={17} />
            <span>Civic Problems ({problems.length})</span>
          </Link>

          <Link
            href={`/?tab=solutions${selectedCategory ? `&category=${selectedCategory}` : ""}${
              searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
            }`}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap no-underline ${
              activeTab === "solutions"
                ? "border-[#6366F1] text-[#6366F1]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Lightbulb size={17} />
            <span>Academic Solutions ({solutions.length})</span>
          </Link>

          <Link
            href={`/?tab=partnerships${selectedCategory ? `&category=${selectedCategory}` : ""}${
              searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
            }`}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap no-underline ${
              activeTab === "partnerships"
                ? "border-[#F59E0B] text-[#D97706]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Handshake size={17} />
            <span>Industry Partnerships ({partnerships.length})</span>
          </Link>
        </div>

        {/* Tab Content: Problems */}
        {activeTab === "problems" && (
          <div>
            {problems.length === 0 ? (
              <div className="card text-center py-16 text-gray-500 space-y-3">
                <MapPin className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="font-bold text-gray-800 text-lg">No civic problems found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your search query or selecting a different category from above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-feed-enter">
                {problems.map((p) => (
                  <ProblemCard key={p.id} problem={p} href={`/problems/${p.id}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Solutions */}
        {activeTab === "solutions" && (
          <div>
            {solutions.length === 0 ? (
              <div className="card text-center py-16 text-gray-500 space-y-3">
                <Lightbulb className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="font-bold text-gray-800 text-lg">No academic solutions found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your search query or selecting a different category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-feed-enter">
                {solutions.map((sol) => (
                  <div
                    key={sol.id}
                    className="card card-hover flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="badge bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
                          <Building2 size={13} />
                          <span>{sol.university.name}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(sol.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <h2 className="font-bold text-gray-900 text-lg leading-snug">{sol.title}</h2>

                      <div className="bg-[#FAFAF9] p-3 rounded-xl border border-gray-200/70 text-xs text-gray-600">
                        <span className="font-bold text-gray-800">Problem:</span> {sol.problem.title}{" "}
                        <span className="text-gray-400">({sol.problem.location})</span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{sol.description}</p>
                    </div>

                    <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                        <Handshake size={14} className="text-indigo-600" />
                        <span>{sol._count.partnerships} partnership proposal{sol._count.partnerships !== 1 ? "s" : ""}</span>
                      </span>
                      <Link
                        href={`/solutions/${sol.id}`}
                        className="btn-outline text-xs py-1.5 px-3.5 no-underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Partnerships */}
        {activeTab === "partnerships" && (
          <div>
            {partnerships.length === 0 ? (
              <div className="card text-center py-16 text-gray-500 space-y-3">
                <Handshake className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="font-bold text-gray-800 text-lg">No industry partnerships found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your search query or choosing a different category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-feed-enter">
                {partnerships.map((p) => (
                  <div
                    key={p.id}
                    className="card card-hover space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="badge bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                          {p.industry.name} (Industry)
                        </span>
                        <StatusPill status={p.status} />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{p.solution.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          University: <span className="font-semibold text-gray-700">{p.solution.university.name}</span> • Problem:{" "}
                          <span className="font-semibold text-gray-700">{p.solution.problem.title}</span>
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-3 bg-[#FAFAF9] p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                        {p.proposalDetails}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/solutions/${p.solution.id}`}
                        className="btn-outline text-xs py-1.5 px-3.5 no-underline"
                      >
                        View Solution Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200/80 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">
            JanSamadhan — Empowering Citizens, Universities & Industry for Civic Impact.
          </p>
          <p>© {new Date().getFullYear()} JanSamadhan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
