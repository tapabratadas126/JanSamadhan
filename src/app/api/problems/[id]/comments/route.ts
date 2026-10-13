import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem || problem.isDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only approved problems have public comments
  const isApproved = problem.approvalStatus === "APPROVED";
  const isAuthor = session?.userId === problem.postedById;
  const isAdmin = session?.role === "ADMIN";

  if (!isApproved && !isAuthor && !isAdmin) {
    return NextResponse.json(
      { error: "Comments are strictly available on approved problems" },
      { status: 403 }
    );
  }

  const comments = await prisma.problemComment.findMany({
    where: { problemId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          orgName: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const problem = await prisma.problem.findUnique({ where: { id } });

  if (!problem || problem.isDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strict check: rejection with 403 if approvalStatus is not 'APPROVED'
  if (problem.approvalStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Comments can only be posted on approved problems" },
      { status: 403 }
    );
  }

  // Admin is reviewer/moderator - comment posting disabled for admin
  if (session.role === "ADMIN") {
    return NextResponse.json(
      { error: "Admins cannot post comments on problems" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { content, parentId } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "Comment text cannot be empty" },
      { status: 400 }
    );
  }

  if (parentId) {
    const parentComment = await prisma.problemComment.findUnique({
      where: { id: parentId },
    });
    if (!parentComment || parentComment.problemId !== id) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 400 }
      );
    }
  }

  const newComment = await prisma.problemComment.create({
    data: {
      problemId: id,
      userId: session.userId,
      content: content.trim(),
      parentId: parentId || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          orgName: true,
        },
      },
    },
  });

  return NextResponse.json(newComment, { status: 201 });
}
