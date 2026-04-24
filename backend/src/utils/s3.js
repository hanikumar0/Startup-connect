import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

/**
 * Verifies S3 credentials and bucket accessibility
 */
export const checkS3Connection = async () => {
    try {
        if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID) {
            return { status: "warn", message: "AWS Credentials missing" };
        }
        await s3Client.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }));
        return { status: "ok", message: "Connected" };
    } catch (error) {
        return { status: "fail", message: error.message };
    }
};

export const uploadToS3 = async (file, folder = "others", retries = 2) => {
    const fileExtension = file.originalname.split(".").pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    for (let i = 0; i < retries; i++) {
        try {
            await s3Client.send(command);
            const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
            return { url, key };
        } catch (error) {
            if (i === retries - 1) {
                console.error(`[S3] Upload failed after ${retries} attempts:`, error.message);
                throw new Error(`S3 Upload failed: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
};

export const getSignedUrl = async (key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        });
        return await getS3SignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
        console.error("[S3] Failed to generate signed URL:", error.message);
        return null;
    }
};
