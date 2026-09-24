import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "INDUSTRY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: solutionId } = await params;
  const body = await request.json();
  const { proposalDetails } = body;

  if (!proposalDetails) {
    return NextResponse.json(
      { error: "Proposal details required" },
      { status: 400 }
    );
  }

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    include: { university: true },
  });
  if (!solution) {
    return NextResponse.json({ error: "Solution not found" }, { status: 404 });
  }

  const partnership = await prisma.partnership.create({
    data: {
      solutionId,
      industryId: session.userId,
      proposalDetails,
    },
  });

  // Notify university
  await createNotification(
    solution.universityId,
    "NEW_PARTNERSHIP",
    `An industry partner has proposed a partnership on your solution: "${solution.title}"`,
    `/university/solutions/${solutionId}`
  );

  return NextResponse.json(partnership, { status: 201 });
}
