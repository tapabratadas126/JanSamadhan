import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // "APPROVE" | "REJECT"

    const entry = await prisma.portfolioEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Portfolio entry not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const updated = await prisma.portfolioEntry.update({
        where: { id },
        data: {
          verified: true,
          verifiedById: session.userId,
          verifiedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, action: "APPROVED", entry: updated });
    } else if (action === "REJECT" || action === "DELETE") {
      // Prompt says: "Reject (deletes the entry, or add a rejected flag if you'd rather keep a record — your call, simplest is fine)"
      await prisma.portfolioEntry.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, action: "DELETED", message: "Portfolio entry removed" });
    } else if (action === "CANCEL") {
      const updated = await prisma.portfolioEntry.update({
        where: { id },
        data: {
          verified: false,
          verifiedById: null,
          verifiedAt: null,
        },
      });
      return NextResponse.json({ success: true, action: "CANCELLED", entry: updated });
    } else {
      return NextResponse.json({ error: "Invalid action. Expected APPROVE, REJECT, CANCEL, or DELETE" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin portfolio verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
