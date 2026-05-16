import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT || "",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
})

export async function uploadToS3(file: Buffer, fileName: string, contentType: string) {
    // DEMO BYPASS: If no S3 config, just simulate
    if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID) {
        console.log("Demo Mode: Simulating upload for", fileName)
        return `https://demo-storage.dronehub.global/${fileName}`
    }

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: file,
        ContentType: contentType,
    })

    try {
        await s3Client.send(command)
        return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`
    } catch (error) {
        console.error("S3 Upload Error:", error)
        throw error
    }
}

export async function getDownloadUrl(fileName: string) {
    if (!process.env.S3_BUCKET) return `https://demo-storage.dronehub.global/${fileName}`

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
    })

    try {
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    } catch (error) {
        console.error("S3 Signed URL Error:", error)
        return null
    }
}
