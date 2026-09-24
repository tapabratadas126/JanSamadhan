import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Handshake, Search } from "lucide-react";
import { StatusPill } from "@/components/problems/ProblemCard";
import { CATEGORIES } from "@/components/problems/CategoryPicker";

interface SearchParams {
  category?: string;
  search?: string;
}

export default async function PublicPartnershipsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const selectedCategory = params.category;
  const searchQuery = params.search;

  const whereClause: any = {};
  if (selectedCategory) {
    whereClause.solution = { problem: { category: selectedCategory } };
  }
  if (searchQuery) {
    whereClause.OR = [
      { proposalDetails: { contains: searchQuery } },
      { industry: { name: { contains: searchQuery } } },
      { solution: { title: { contains: searchQuery } } },
    ];
  }

  const partnerships = await prisma.partnership.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
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
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar role={session?.role} userName={session?.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">Browse Industry Partnerships</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Explore CSR resource commitments, equipment sponsorships, and engineering partnerships proposed by corporate entities.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="card space-y-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search partnerships, industry names, or solution titles..."
                className="input pl-10"
              />
            </div>
            {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            <button type="submit" className="btn-primary text-sm py-2.5 px-6">
              Search
            </button>
          </form>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Link
              href="/partnerships"
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
                href={`/partnerships?category=${cat.value}${
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

        {/* Partnerships List */}
        {partnerships.length === 0 ? (
          <div className="card text-center py-16 text-gray-500 space-y-3">
            <Handshake className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg">No partnerships found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Try adjusting your search query or selecting a different category.
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
                      {p.industry.name} (Industry Partner)
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
      </main>
    </div>
  );
}
