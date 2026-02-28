import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, BUCKET_NAME } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Readable } from 'stream';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function isAllowedImageType(mimeType: string): boolean {
    return ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase());
}

export function getMaxUploadSize(): number {
    return MAX_FILE_SIZE;
}

export const uploadToS3 = async (
    fileStream: Readable,
    fileName: string,
    mimeType: string,
    folder = 'avatars'
): Promise<string> => {
    const region = (process.env.AWS_REGION || 'us-east-1').trim();
    if (!BUCKET_NAME) {
        throw new Error('S3 bucket not configured');
    }
    const key = `${folder.replace(/\/$/, '')}/${uuidv4()}${path.extname(fileName)}`;

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: mimeType,
        },
    });

    await upload.done();
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
};
