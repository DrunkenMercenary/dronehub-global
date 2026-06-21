import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

export const runtime = "nodejs"

const TYPES: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
    const { key } = await params

    // Single path segment only; reject anything that could traverse directories.
    if (!key || key.includes("/") || key.includes("\\") || key.includes("..")) {
        return new NextResponse("Bad request", { status: 400 })
    }

    const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads")
    const filePath = path.join(dir, key)

    try {
        const data = await fs.readFile(filePath)
        const ext = path.extname(key).toLowerCase()
        return new NextResponse(new Uint8Array(data), {
            headers: {
                "Content-Type": TYPES[ext] || "application/octet-stream",
                "Content-Disposition": `inline; filename="${key}"`,
                "Cache-Control": "private, max-age=3600",
            },
        })
    } catch {
        return new NextResponse("Not found", { status: 404 })
    }
}
