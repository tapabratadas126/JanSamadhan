import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rating = await prisma.partnershipRating.findUnique({
      where: { partnershipId: id },
      include: {
        ratedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!rating) {
      return NextResponse.json({ rating: null });
    }

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Fetch rating error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin role required to rate partnerships." },
        { status: 401 }
      );
    }

    const { id: partnershipId } = await params;
    const body = await request.json();
    const {
      qualityScore,
      budgetAdherenceScore,
      timelinessScore,
      communicationScore,
      comment,
    } = body;

    // Validate scores 1-5
    const scores = [qualityScore, budgetAdherenceScore, timelinessScore, communicationScore];
    for (const score of scores) {
      if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
        return NextResponse.json(
          { error: "Scores must be integers between 1 and 5" },
          { status: 400 }
        );
      }
    }

    // Verify partnership exists and is COMPLETED
    const partnership = await prisma.partnership.findUnique({
      where: { id: partnershipId },
      include: { industry: true, solution: true },
    });

    if (!partnership) {
      return NextResponse.json({ error: "Partnership not found" }, { status: 404 });
    }

    if (partnership.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "A PartnershipRating can only be created/edited once the Partnership status is COMPLETED" },
        { status: 400 }
      );
    }

    // Upsert rating (one rating per partnership)
    const rating = await prisma.partnershipRating.upsert({
      where: { partnershipId },
      create: {
        partnershipId,
        ratedById: session.userId,
        qualityScore,
        budgetAdherenceScore,
        timelinessScore,
        communicationScore,
        comment: comment?.trim() || null,
      },
      update: {
        ratedById: session.userId,
        qualityScore,
        budgetAdherenceScore,
        timelinessScore,
        communicationScore,
        comment: comment?.trim() || null,
      },
      include: {
        ratedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error("Save rating error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
