import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import path from "path"
import { promises as fs } from "fs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToS3 } from "@/lib/s3"

export const runtime = "nodejs"

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

function safeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "upload"
}

export async function POST(req: NextRequest) {
    // Require an authenticated user so the endpoint cannot be abused anonymously.
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const form = await req.formData()
        const file = form.get("file")
        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const blob = file as File
        if (blob.size > MAX_BYTES) {
            return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 413 })
        }

        const buffer = Buffer.from(await blob.arrayBuffer())
        const key = `${randomUUID()}-${safeName(blob.name || "upload")}`

        // Use S3/R2 when configured, otherwise persist to local disk.
        if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
            const url = await uploadToS3(buffer, key, blob.type || "application/octet-stream")
            return NextResponse.json({ url, name: blob.name })
        }

        const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads")
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(path.join(dir, key), buffer)
        return NextResponse.json({ url: `/api/files/${key}`, name: blob.name })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
