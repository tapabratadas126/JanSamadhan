import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";

  const where: Record<string, unknown> = {};

  if (mine) {
    const session = await getSession();
    if (session) {
      if (session.role === "INDUSTRY") {
        where.industryId = session.userId;
      } else if (session.role === "UNIVERSITY") {
        where.solution = { universityId: session.userId };
      }
    }
  }

  const partnerships = await prisma.partnership.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      industry: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } },
      solution: {
        include: {
          university: { select: { id: true, name: true } },
          problem: { select: { id: true, title: true, category: true } },
        },
      },
    },
  });

  return NextResponse.json({ partnerships });
}
