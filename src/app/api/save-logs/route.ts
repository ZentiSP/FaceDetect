import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { sessionId, logs } = (await req.json()) as {
      sessionId: number; // or string, depending on your schema
      logs: Omit<Prisma.LogCreateManyInput, "sessionId">[]; // everything except sessionId
    };

    await prisma.log.createMany({
      data: logs.map((log): Prisma.LogCreateManyInput => ({
        ...log,
        sessionId, // add sessionId explicitly
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving logs:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
