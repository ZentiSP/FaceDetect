import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  await prisma.session.update({
    where: { id: sessionId },
    data: { endedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
