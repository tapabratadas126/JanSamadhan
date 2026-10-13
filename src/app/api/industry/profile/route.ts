import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "INDUSTRY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, orgName: true, role: true },
      }),
      prisma.industryProfile.findUnique({
        where: { userId: session.userId },
      }),
    ]);

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "INDUSTRY") {
      return NextResponse.json(
        { error: "Unauthorized. Industry role required to manage industry profile." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, description, website } = body;

    if (!companyName?.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: "Company description is required" }, { status: 400 });
    }

    // Format website URL if provided
    let cleanWebsite = website?.trim() || null;
    if (cleanWebsite && !cleanWebsite.startsWith("http://") && !cleanWebsite.startsWith("https://")) {
      cleanWebsite = `https://${cleanWebsite}`;
    }

    const profile = await prisma.industryProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        companyName: companyName.trim(),
        description: description.trim(),
        website: cleanWebsite,
      },
      update: {
        companyName: companyName.trim(),
        description: description.trim(),
        website: cleanWebsite,
      },
    });

    // Also keep user.orgName synced
    await prisma.user.update({
      where: { id: session.userId },
      data: { orgName: companyName.trim() },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Save industry profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
