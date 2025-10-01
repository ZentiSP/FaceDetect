import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, logs } = await req.json();

    await prisma.log.createMany({
      data: logs.map((log: any) => ({
        timestamp: log.timestamp,
        detection: log.detection,
        sessionId,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving logs:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
