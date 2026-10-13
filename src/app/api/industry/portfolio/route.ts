import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "INDUSTRY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = await prisma.portfolioEntry.findMany({
      where: { industryId: session.userId },
      orderBy: { yearCompleted: "desc" },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Fetch portfolio error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "INDUSTRY") {
      return NextResponse.json(
        { error: "Unauthorized. Industry role required to submit portfolio entries." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectTitle, description, clientOrAuthority, yearCompleted } = body;

    if (!projectTitle?.trim() || !description?.trim() || !clientOrAuthority?.trim()) {
      return NextResponse.json(
        { error: "Project title, description, and client/authority are required" },
        { status: 400 }
      );
    }

    const parsedYear = parseInt(yearCompleted, 10);
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      return NextResponse.json(
        { error: "Valid year completed is required (between 1900 and 2100)" },
        { status: 400 }
      );
    }

    const entry = await prisma.portfolioEntry.create({
      data: {
        industryId: session.userId,
        projectTitle: projectTitle.trim(),
        description: description.trim(),
        clientOrAuthority: clientOrAuthority.trim(),
        yearCompleted: parsedYear,
        verified: false,
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Create portfolio entry error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
