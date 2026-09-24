import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortParam =
    searchParams.get("sort_by") || searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";
  const locationParam =
    searchParams.get("location") || searchParams.get("location_text") || "";
  const searchQuery = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));

  const mine = searchParams.get("mine") === "true";

  const where: Record<string, unknown> = { isDeleted: false };
  if (category) where.category = category;

  if (locationParam) {
    where.location = { contains: locationParam };
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { location: { contains: searchQuery } },
    ];
  }

  if (mine) {
    const session = await getSession();
    if (session) {
      where.postedById = session.userId;
    }
  } else {
    // Public feed: strictly show only approved problems
    where.approvalStatus = "APPROVED";
  }

  let orderBy: any = { createdAt: "desc" as const };
  const normalizedSort = sortParam.toLowerCase();
  if (normalizedSort === "location") {
    orderBy = { location: "asc" as const };
  } else if (
    normalizedSort === "most_upvoted" ||
    normalizedSort === "priority" ||
    normalizedSort === "upvotes"
  ) {
    orderBy = { upvoteCount: "desc" as const };
  } else {
    orderBy = { createdAt: "desc" as const };
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        postedBy: { select: { id: true, name: true } },
        _count: { select: { solutions: true } },
      },
    }),
    prisma.problem.count({ where }),
  ]);

  return NextResponse.json({ problems, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "CITIZEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, location, mediaUrls } = body;

    if (!title || !description || !category || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        category,
        location,
        mediaUrls: JSON.stringify(mediaUrls || []),
        postedById: session.userId,
        approvalStatus: "PENDING",
      },
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
