import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const entry = await prisma.portfolioEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Portfolio entry not found" }, { status: 404 });
    }

    // Must be either owner or admin
    if (session.role !== "ADMIN" && entry.industryId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.portfolioEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Portfolio entry deleted" });
  } catch (error) {
    console.error("Delete portfolio entry error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
