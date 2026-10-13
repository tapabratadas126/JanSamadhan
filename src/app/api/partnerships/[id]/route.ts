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

    const existing = await prisma.partnership.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Partnership not found" }, { status: 404 });
    }

    // Delete associated rating first (to avoid foreign key constraint issues in SQLite)
    await prisma.partnershipRating.deleteMany({
      where: { partnershipId: id },
    });

    // Delete partnership
    await prisma.partnership.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Partnership deleted successfully" });
  } catch (error) {
    console.error("Error deleting partnership:", error);
    return NextResponse.json({ error: "Failed to delete partnership" }, { status: 500 });
  }
}
