import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Lightbulb, Plus } from "lucide-react";
import ProblemCard from "@/components/problems/ProblemCard";
import ProblemFeedFilters from "@/components/problems/ProblemFeedFilters";
import LocationGroupedFeed from "@/components/problems/LocationGroupedFeed";

interface SearchParams {
  category?: string;
  search?: string;
  location?: string;
  location_text?: string;
  sort?: string;
  sort_by?: string;
  group?: string;
}

export default async function PublicProblemsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getSession();

  const selectedCategory = params.category || "";
  const searchQuery = params.search || "";
  const locationQuery = params.location || params.location_text || "";
  const sortParam = params.sort_by || params.sort || "newest";
  const groupMode = params.group || "none";

  // Fetch all distinct locations for populating location filter dropdown
  const allApprovedProblems = await prisma.problem.findMany({
    where: { approvalStatus: "APPROVED", isDeleted: false },
    select: { location: true },
  });

  const locationSet = new Set<string>();
  const districtSet = new Set<string>();

  for (const p of allApprovedProblems) {
    if (!p.location) continue;
    const trimmed = p.location.trim();
    if (!trimmed) continue;
    locationSet.add(trimmed);

    const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      const district = parts[parts.length - 1];
      if (district) districtSet.add(district);
    }
  }

  const availableLocations = Array.from(
    new Set([...districtSet, ...locationSet])
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  // Build Prisma where clause
  const whereClause: any = { approvalStatus: "APPROVED", isDeleted: false };

  if (selectedCategory) {
    whereClause.category = selectedCategory;
  }

  if (locationQuery) {
    whereClause.location = { contains: locationQuery };
  }

  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { location: { contains: searchQuery } },
    ];
  }

  // Determine ordering
  let orderBy: any = { createdAt: "desc" };
  const normalizedSort = sortParam.toLowerCase();

  if (normalizedSort === "location") {
    orderBy = { location: "asc" };
  } else if (
    normalizedSort === "most_upvoted" ||
    normalizedSort === "priority" ||
    normalizedSort === "upvotes"
  ) {
    orderBy = { upvoteCount: "desc" };
  } else {
    orderBy = { createdAt: "desc" };
  }

  const problems = await prisma.problem.findMany({
    where: whereClause,
    orderBy,
    include: {
      postedBy: { select: { id: true, name: true } },
      _count: { select: { solutions: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar role={session?.role} userName={session?.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933]">
              Browse Civic Problems
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Explore, filter, and sort civic issues reported by citizens across communities.
            </p>
          </div>

          {session?.role === "CITIZEN" ? (
            <Link
              href="/citizen/problems/new"
              className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2 no-underline"
            >
              <Plus size={16} />
              <span>Report New Problem</span>
            </Link>
          ) : !session ? (
            <Link
              href="/login?redirect=/citizen/problems/new"
              className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2 no-underline"
            >
              <Plus size={16} />
              <span>Report Problem (Sign In)</span>
            </Link>
          ) : null}
        </div>

        {/* Filter Controls Bar */}
        <ProblemFeedFilters
          availableLocations={availableLocations}
          currentCategory={selectedCategory}
          currentSearch={searchQuery}
          currentLocation={locationQuery}
          currentSort={sortParam}
          currentGroup={groupMode}
        />

        {/* Problem Feed Display */}
        {problems.length === 0 ? (
          <div className="card text-center py-16 text-gray-500 space-y-3">
            <Lightbulb className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg">No civic problems found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Try adjusting your search query, location filter, or selecting a different category.
            </p>
          </div>
        ) : groupMode === "location" ? (
          <LocationGroupedFeed problems={problems} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-feed-enter">
            {problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                href={`/problems/${problem.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
