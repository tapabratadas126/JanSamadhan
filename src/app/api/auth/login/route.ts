import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJWT, getRoleDashboard } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier and password are required" },
        { status: 400 }
      );
    }

    // Find by email or phone
    const isEmail = identifier.includes("@");
    const user = isEmail
      ? await prisma.user.findUnique({ where: { email: identifier } })
      : await prisma.user.findUnique({ where: { phone: identifier } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signJWT({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    const response = NextResponse.json({
      success: true,
      redirectTo: getRoleDashboard(user.role),
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
