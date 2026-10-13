import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJWT, getRoleDashboard } from "@/lib/auth";

export async function handleRegistration(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;
    const orgName = (body.org_name || body.orgName || "").trim();

    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name, password, and either email or phone are required" },
        { status: 400 }
      );
    }

    const formattedRole = typeof role === "string" ? role.toUpperCase() : "";

    if (!["CITIZEN", "UNIVERSITY", "INDUSTRY"].includes(formattedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Application layer validation for organization name
    if (["UNIVERSITY", "INDUSTRY"].includes(formattedRole) && !orgName) {
      return NextResponse.json(
        { error: "Organization name is required for University and Industry accounts" },
        { status: 400 }
      );
    }

    // Check duplicate
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
    }
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: formattedRole,
        orgName: ["UNIVERSITY", "INDUSTRY"].includes(formattedRole) ? orgName : (orgName || null),
      },
    });

    const token = await signJWT({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    const response = NextResponse.json(
      { success: true, redirectTo: getRoleDashboard(user.role) },
      { status: 201 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleRegistration(request);
}

