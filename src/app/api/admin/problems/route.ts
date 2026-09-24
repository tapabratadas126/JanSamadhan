import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const approvalStatus = searchParams.get("approvalStatus") || "ALL";
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: Record<string, unknown> = {};

    if (approvalStatus !== "ALL") {
      where.approvalStatus = approvalStatus;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          postedBy: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { solutions: true } },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return NextResponse.json({ problems, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
