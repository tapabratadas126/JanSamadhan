import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const solution = await prisma.solution.findUnique({
    where: { id },
    include: {
      university: { select: { id: true, name: true } },
      problem: { select: { id: true, title: true, category: true, location: true, status: true, postedById: true } },
      partnerships: {
        include: {
          industry: { select: { id: true, name: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!solution) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(solution);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.solution.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    // Find and delete any partnerships and ratings associated with this solution
    const partnerships = await prisma.partnership.findMany({
      where: { solutionId: id },
      select: { id: true },
    });
    const partnershipIds = partnerships.map((p) => p.id);
    if (partnershipIds.length > 0) {
      await prisma.partnershipRating.deleteMany({
        where: { partnershipId: { in: partnershipIds } },
      });
      await prisma.partnership.deleteMany({
        where: { id: { in: partnershipIds } },
      });
    }

    await prisma.solution.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Solution deleted successfully" });
  } catch (error) {
    console.error("Error deleting solution:", error);
    return NextResponse.json({ error: "Failed to delete solution" }, { status: 500 });
  }
}
