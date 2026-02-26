import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, BUCKET_NAME } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Readable } from 'stream';

export const uploadToS3 = async (fileStream: Readable, fileName: string, mimeType: string): Promise<string> => {
    const key = `avatars/${uuidv4()}${path.extname(fileName)}`;

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: mimeType,
            // ACL: 'public-read', // Uncomment if bucket is public and you want files to be public
        },
    });

    await upload.done();

    // Construct the URL. Note: This depends on your S3 bucket configuration.
    // If using CloudFront or a custom domain, you'd return that here.
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};
