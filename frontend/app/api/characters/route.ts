import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CHARACTERS } from "@/public/gameResources/heroes";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";


