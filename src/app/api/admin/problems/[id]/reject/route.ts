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
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

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
        approvalStatus: "REJECTED",
        rejectionReason: reason || "Submission does not meet community guidelines.",
      },
    });

    // Send notification to submitting citizen
    const rejectionText = reason ? ` Reason: ${reason}` : "";
    await createNotification(
      existing.postedById,
      "PROBLEM_REJECTED",
      `Your problem "${existing.title}" was rejected.${rejectionText}`,
      `/citizen/my-problems`
    );

    return NextResponse.json({ success: true, problem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
