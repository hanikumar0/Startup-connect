import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export const uploadToS3 = async (file) => {
    const fileExtension = file.originalname.split(".").pop();
    const key = `pitch-decks/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'private' is not always supported depending on bucket settings, 
        // using v3 PutObjectCommand defaults to bucket settings.
    });

    await s3Client.send(command);

    // Construct the public URL (or use the signed URL utility for private files)
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        url,
        key: key
    };
};

export const getSignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    return await getS3SignedUrl(s3Client, command, { expiresIn: 3600 });
};
