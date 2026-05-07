import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";

export async function POST(req: Request)
{
    const h = await headers();
    const ip = h
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:${ip}`, 5, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }

    try {
        const formData = await req.formData();

        const file = formData.get("file") as File;
        const url = formData.get("url") as string;

        const toSizeLabel = (bytes: number) => {
            if (bytes < 1024) return `${bytes} o`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
            return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
        };
    
        const a = await prisma.attachment.create({
            data: {
                name: `${Date.now()}-${file.name}`,
                sizeLabel: toSizeLabel(file.size),
                type: file.type,
                previewUrl: `/images/${url}`
            }
        });
        return Response.json({id: a.id}, {status: 201});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}

export async function DELETE(req: Request)
{
    const h = await headers();
    const ip = h
    .get("x-forwarded-for")
    ?.split(",")[0]
    .trim() || "unknown";

    const allowed = await rateLimit(redis, `rl:${ip}`, 5, 1);

    if (!allowed) {
        console.log("Too many requests");
        return Response.json({error: "Too many request"}, {status: 429});
    }

    try {
        const {searchParams} = new URL(req.url);
        const attachmentId = searchParams.get("attachmentId");
        if (!attachmentId)
            return Response.json({error: "Internal server error"}, {status: 500});

        await prisma.attachment.delete({
            where: { id: attachmentId }
        });

        return Response.json({message: "OK"}, {status: 200});
    }
    catch {
        return Response.json({error: "Internal server error"}, {status: 500});
    }
}
