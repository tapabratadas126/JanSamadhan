import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      where: {
        approvalStatus: "APPROVED",
        isDeleted: false,
      },
      select: {
        location: true,
      },
    });

    const rawLocationSet = new Set<string>();
    const districtSet = new Set<string>();

    for (const p of problems) {
      if (!p.location) continue;
      const trimmed = p.location.trim();
      if (!trimmed) continue;

      rawLocationSet.add(trimmed);

      // Cleaned/grouped subset: split on last comma-separated segment to approximate district/city
      const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        const lastSegment = parts[parts.length - 1];
        if (lastSegment) {
          districtSet.add(lastSegment);
        }
      }
    }

    const rawLocations = Array.from(rawLocationSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    const districts = Array.from(districtSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    // Comprehensive distinct list of location options
    const combinedSet = new Set<string>([...districts, ...rawLocations]);
    const locations = Array.from(combinedSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return NextResponse.json({
      locations,
      districts,
      rawLocations,
    });
  } catch (error) {
    console.error("Error fetching problem locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem locations" },
      { status: 500 }
    );
  }
}
