import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // ── Aggregate stats (only public items: approved & not deleted) ─────────────
  const [problemCount, solutionCount, partnershipCount, categoryGroups, latestChain] =
    await Promise.all([
      prisma.problem.count({
        where: { approvalStatus: "APPROVED", isDeleted: false },
      }),
      prisma.solution.count({
        where: { problem: { approvalStatus: "APPROVED", isDeleted: false } },
      }),
      prisma.partnership.count({
        where: {
          status: "APPROVED",
          solution: { problem: { approvalStatus: "APPROVED", isDeleted: false } },
        },
      }),
      prisma.problem.groupBy({
        by: ["category"],
        where: { approvalStatus: "APPROVED", isDeleted: false },
        _count: { id: true },
      }),
      prisma.problem.findFirst({
        where: {
          approvalStatus: "APPROVED",
          isDeleted: false,
          solutions: {
            some: {
              partnerships: {
                some: { status: "APPROVED" },
              },
            },
          },
        },
        include: {
          postedBy: { select: { name: true } },
          solutions: {
            where: {
              partnerships: {
                some: { status: "APPROVED" },
              },
            },
            include: {
              university: { select: { name: true } },
              partnerships: {
                where: { status: "APPROVED" },
                include: {
                  industry: { select: { name: true } },
                },
                take: 1,
              },
            },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const categoryCounts: Record<string, number> = {};
  categoryGroups.forEach((g) => {
    categoryCounts[g.category] = g._count.id;
  });

  // ── Problems feed (strictly approved & not deleted) ───────────────────────────
  const problemWhere: Record<string, unknown> = {
    approvalStatus: "APPROVED",
    isDeleted: false,
  };
  if (selectedCategory) problemWhere.category = selectedCategory;
  if (searchQuery) {
    problemWhere.AND = [
      { approvalStatus: "APPROVED" },
      { isDeleted: false },
      {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
          { location: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
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

  // ── Solutions feed (strictly linked to approved & not deleted problem) ─────────
  const solutionWhere: Record<string, unknown> = {
    problem: { approvalStatus: "APPROVED", isDeleted: false },
  };
  if (selectedCategory) {
    solutionWhere.problem = {
      category: selectedCategory,
      approvalStatus: "APPROVED",
      isDeleted: false,
    };
  }
  if (searchQuery) {
    solutionWhere.AND = [
      { problem: { approvalStatus: "APPROVED", isDeleted: false } },
      {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
          {
            problem: {
              title: { contains: searchQuery, mode: "insensitive" },
              approvalStatus: "APPROVED",
              isDeleted: false,
            },
          },
          { university: { name: { contains: searchQuery, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const solutions = await prisma.solution.findMany({
    where: solutionWhere,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      university: { select: { id: true, name: true } },
      problem: {
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          status: true,
        },
      },
      _count: { select: { partnerships: true } },
    },
  });

  // ── Partnerships feed (strictly APPROVED partnerships on approved problems) ────
  const partnershipWhere: Record<string, unknown> = {
    status: "APPROVED",
    solution: { problem: { approvalStatus: "APPROVED", isDeleted: false } },
  };
  if (selectedCategory) {
    partnershipWhere.solution = {
      problem: {
        category: selectedCategory,
        approvalStatus: "APPROVED",
        isDeleted: false,
      },
    };
  }
  if (searchQuery) {
    partnershipWhere.AND = [
      { status: "APPROVED" },
      { solution: { problem: { approvalStatus: "APPROVED", isDeleted: false } } },
      {
        OR: [
          { proposalDetails: { contains: searchQuery, mode: "insensitive" } },
          { industry: { name: { contains: searchQuery, mode: "insensitive" } } },
          { solution: { title: { contains: searchQuery, mode: "insensitive" } } },
        ],
      },
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
          problem: {
            select: { id: true, title: true, category: true, location: true },
          },
        },
      },
    },
  });

  return (
    <>
      <Navbar role={session?.role} userName={session?.name} />
      <HomeClient
        session={session}
        problemCount={problemCount}
        solutionCount={solutionCount}
        partnershipCount={partnershipCount}
        categoryCounts={categoryCounts}
        latestChain={latestChain}
        problems={problems}
        solutions={solutions}
        partnerships={partnerships}
        activeTab={activeTab}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />
    </>
  );
}
