import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ALLOWED_ROLES = ["CITIZEN", "UNIVERSITY", "INDUSTRY"];

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "ADMIN") {
    return NextResponse.json(
      { error: "Admins cannot upvote problems" },
      { status: 403 }
    );
  }

  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: problemId } = await params;

  const existing = await prisma.upvote.findUnique({
    where: { problemId_userId: { problemId, userId: session.userId } },
  });

  if (existing) {
    // Toggle off
    await prisma.$transaction([
      prisma.upvote.delete({ where: { id: existing.id } }),
      prisma.problem.update({
        where: { id: problemId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ upvoted: false });
  } else {
    // Toggle on
    await prisma.$transaction([
      prisma.upvote.create({ data: { problemId, userId: session.userId } }),
      prisma.problem.update({
        where: { id: problemId },
        data: { upvoteCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ upvoted: true });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "ADMIN") {
    return NextResponse.json(
      { error: "Admins cannot upvote problems" },
      { status: 403 }
    );
  }

  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: problemId } = await params;

  const existing = await prisma.upvote.findUnique({
    where: { problemId_userId: { problemId, userId: session.userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.upvote.delete({ where: { id: existing.id } }),
      prisma.problem.update({
        where: { id: problemId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ]);
  }

  return NextResponse.json({ upvoted: false });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id: problemId } = await params;

  if (!session) return NextResponse.json({ upvoted: false });

  const upvote = await prisma.upvote.findUnique({
    where: { problemId_userId: { problemId, userId: session.userId } },
  });

  return NextResponse.json({ upvoted: !!upvote });
}

