import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      postedBy: { select: { id: true, name: true } },
      solutions: {
        include: {
          university: { select: { id: true, name: true } },
          partnerships: {
            include: {
              industry: { select: { id: true, name: true } },
              reviewedBy: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      editHistory: {
        include: { editedBy: { select: { id: true, name: true } } },
        orderBy: { editedAt: "desc" },
      },
      _count: { select: { solutions: true } },
    },
  });

  if (!problem || problem.isDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(problem);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem || problem.isDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session.role === "ADMIN";
  const isOwner = session.userId === problem.postedById;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};

  // Status update (allowed for Admin or Owner Citizen)
  if (body.status !== undefined) {
    const validStatuses = ["OPEN", "SOLUTION_PROPOSED", "PARTNERSHIP_APPROVED", "RESOLVED"];
    if (validStatuses.includes(body.status)) {
      updateData.status = body.status;
    }
  }

  // Approval status update (allowed for Admin)
  if (isAdmin && body.approvalStatus !== undefined) {
    const validApprovalStatuses = ["PENDING", "APPROVED", "UNDER_REVIEW", "REJECTED"];
    if (validApprovalStatuses.includes(body.approvalStatus)) {
      updateData.approvalStatus = body.approvalStatus;
      if (body.approvalStatus === "APPROVED") {
        updateData.rejectionReason = null;
      }
    }
  }

  if (isAdmin && body.rejectionReason !== undefined) {
    updateData.rejectionReason = body.rejectionReason;
  }

  // Editable text fields with history logging
  const editableFields = ["title", "description", "location", "category"];
  const historyEntries = [];

  for (const field of editableFields) {
    if (body[field] !== undefined && body[field] !== (problem as Record<string, unknown>)[field]) {
      updateData[field] = body[field];
      historyEntries.push({
        problemId: id,
        editedById: session.userId,
        fieldName: field,
        oldValue: String((problem as Record<string, unknown>)[field] ?? ""),
        newValue: String(body[field]),
      });
    }
  }

  if (Object.keys(updateData).length === 0 && historyEntries.length === 0) {
    return NextResponse.json(problem);
  }

  if (historyEntries.length > 0) {
    const [updated] = await prisma.$transaction([
      prisma.problem.update({ where: { id }, data: updateData }),
      prisma.problemEditHistory.createMany({ data: historyEntries }),
    ]);
    return NextResponse.json(updated);
  } else {
    const updated = await prisma.problem.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updated);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem || problem.isDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session.role === "ADMIN";
  const isOwner = session.userId === problem.postedById;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete: set isDeleted = true and deletedAt timestamp
  await prisma.problem.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, isDeleted: true });
}

