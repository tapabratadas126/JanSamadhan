import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.portfolioEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Portfolio entry not found" }, { status: 404 });
    }

    await prisma.portfolioEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Portfolio entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting portfolio entry:", error);
    return NextResponse.json({ error: "Failed to delete portfolio entry" }, { status: 500 });
  }
}
