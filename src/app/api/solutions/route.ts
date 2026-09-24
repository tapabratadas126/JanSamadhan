import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";

  const mine = searchParams.get("mine") === "true";

  const where: Record<string, unknown> = {};
  if (category) {
    where.problem = { category };
  }

  if (mine) {
    const session = await getSession();
    if (session) {
      where.universityId = session.userId;
    }
  }

  const solutions = await prisma.solution.findMany({
    where,
    orderBy: { createdAt: sort === "newest" ? "desc" : "asc" },
    include: {
      university: { select: { id: true, name: true } },
      problem: { select: { id: true, title: true, category: true, location: true, status: true } },
      _count: { select: { partnerships: true } },
    },
  });

  return NextResponse.json({ solutions });
}
