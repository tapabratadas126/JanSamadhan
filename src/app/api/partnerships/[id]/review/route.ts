import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const partnership = await prisma.partnership.findUnique({
    where: { id },
    include: {
      solution: {
        include: {
          university: true,
          problem: true,
        },
      },
      industry: true,
    },
  });

  if (!partnership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.partnership.update({
    where: { id },
    data: {
      status,
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  // Update problem status if approved
  if (status === "APPROVED") {
    await prisma.problem.update({
      where: { id: partnership.solution.problemId },
      data: { status: "PARTNERSHIP_APPROVED" },
    });
  }

  const type =
    status === "APPROVED" ? "PARTNERSHIP_APPROVED" : "PARTNERSHIP_REJECTED";
  const statusWord = status === "APPROVED" ? "approved" : "rejected";

  // Notify industry partner
  await createNotification(
    partnership.industryId,
    type,
    `Your partnership proposal for "${partnership.solution.title}" has been ${statusWord}.`,
    `/industry/partnerships`
  );

  // Notify university
  await createNotification(
    partnership.solution.universityId,
    type,
    `A partnership on your solution "${partnership.solution.title}" has been ${statusWord} by the admin.`,
    `/university/solutions/${partnership.solutionId}`
  );

  return NextResponse.json(updated);
}
