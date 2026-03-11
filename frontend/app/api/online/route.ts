import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { user, socketid } = await req.json();

  await redis.hSet("online_users", socketid, user);

  return NextResponse.json({ success: true });
}