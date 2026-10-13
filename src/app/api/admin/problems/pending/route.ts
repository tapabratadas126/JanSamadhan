import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const problems = await prisma.problem.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { solutions: true } },
      },
    });

    return NextResponse.json({ problems, total: problems.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
