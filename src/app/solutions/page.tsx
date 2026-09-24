import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Lightbulb, Building2, Handshake, Search } from "lucide-react";
import { CATEGORIES } from "@/components/problems/CategoryPicker";

interface SearchParams {
  category?: string;
  search?: string;
}

export default async function PublicSolutionsPage({
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
    whereClause.problem = { category: selectedCategory };
  }
  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { problem: { title: { contains: searchQuery } } },
      { university: { name: { contains: searchQuery } } },
    ];
  }

  const solutions = await prisma.solution.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      university: { select: { name: true } },
      problem: {
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
        },
      },
      _count: { select: { partnerships: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar role={session?.role} userName={session?.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">Browse Academic Solutions</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Explore research-backed and technical solutions proposed by university labs to address civic challenges.
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
                placeholder="Search solutions, universities, or problem titles..."
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
              href="/solutions"
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
                href={`/solutions?category=${cat.value}${
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

        {/* Solutions List */}
        {solutions.length === 0 ? (
          <div className="card text-center py-16 text-gray-500 space-y-3">
            <Lightbulb className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg">No solutions found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
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
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="font-bold text-gray-900 text-lg leading-snug">{sol.title}</h2>

                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
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
      </main>
    </div>
  );
}
