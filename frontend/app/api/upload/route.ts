import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request)
{
    try {
        const formData = await req.formData();
        const files = formData.getAll("file");
        const type = formData.get("type") as string | null;

        if (!files) {
        return new Response("No file uploaded", { status: 400 });
        }
        
        const uploadDir = type === "profile" ? "public/profiles" : "public/images";

        for (const file of files)
        {
            if (!(file instanceof File)) continue;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const safeName = file.name.replace(/\s+/g, "-");
            const fileName = `${Date.now()}-${safeName}`;
            const filePath = path.join(process.cwd(), uploadDir, fileName);
            await writeFile(filePath, buffer);

            return Response.json({
                name: fileName,
                status: 200
            });
        }
    }
    catch (error) {
        console.error(error);
        return new Response("Upload failed", { status: 500 });
    }
}