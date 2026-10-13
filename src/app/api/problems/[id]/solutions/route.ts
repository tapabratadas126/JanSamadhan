import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// POST /api/problems/[id]/solutions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "UNIVERSITY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: problemId } = await params;
  const body = await request.json();
  const { title, description } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description required" },
      { status: 400 }
    );
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const [solution] = await prisma.$transaction([
    prisma.solution.create({
      data: {
        problemId,
        universityId: session.userId,
        title,
        description,
      },
    }),
    prisma.problem.update({
      where: { id: problemId },
      data: { status: "SOLUTION_PROPOSED" },
    }),
  ]);

  // Notify problem poster
  await createNotification(
    problem.postedById,
    "NEW_SOLUTION",
    `A university has proposed a solution for your problem: "${problem.title}"`,
    `/citizen/problems/${problemId}`
  );

  return NextResponse.json(solution, { status: 201 });
}
