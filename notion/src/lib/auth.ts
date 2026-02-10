import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return session.userId;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken: crypto.randomUUID(),
      expires,
    },
  });

  return session.sessionToken;
}
