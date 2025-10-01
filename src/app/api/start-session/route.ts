import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await prisma.session.create({
    data: {},
  });

  return NextResponse.json({ sessionId: session.id });
}
