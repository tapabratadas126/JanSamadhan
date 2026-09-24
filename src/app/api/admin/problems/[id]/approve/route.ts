import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.problem.findUnique({
      where: { id },
      select: { id: true, title: true, postedById: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const problem = await prisma.problem.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        rejectionReason: null,
      },
    });

    // Send notification to submitting citizen
    await createNotification(
      existing.postedById,
      "PROBLEM_APPROVED",
      `Your problem "${existing.title}" has been approved and is now live on the platform.`,
      `/problems/${id}`
    );

    return NextResponse.json({ success: true, problem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
