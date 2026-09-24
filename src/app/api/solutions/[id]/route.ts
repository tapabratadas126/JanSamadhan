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
  await prisma.solution.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
