import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const isPasswordValid = await compare(password, user.hashedPassword);
  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Set secure HTTP-only cookie with JWT
  await setAuthCookie({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  return NextResponse.json(
    { 
      message: "Signed in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    },
    { status: 200 }
  );
}
