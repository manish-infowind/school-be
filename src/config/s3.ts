import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Strip BOM and trim (common .env paste/encoding issues)
const raw = (s: string) => (s || '').replace(/\uFEFF/g, '').trim();
const region = raw(process.env.AWS_REGION || 'us-east-1');
const accessKeyId = raw(process.env.AWS_ACCESS_KEY_ID || '');
// AWS secret is 40 chars; strip quotes, newlines, BOM so .env does not break signature
let secretAccessKey = raw(process.env.AWS_SECRET_ACCESS_KEY || '')
    .replace(/^["']|["']$/g, '')
    .replace(/\r\n|\r|\n/g, '')
    .replace(/[\uFEFF]/g, '')
    .trim();
if (secretAccessKey.length === 41) secretAccessKey = secretAccessKey.slice(0, 40);
// Keep only printable ASCII in secret (avoid invisible chars breaking signature)
secretAccessKey = secretAccessKey.replace(/[^\x20-\x7E]/g, '');
const BUCKET_NAME = raw(process.env.AWS_BUCKET_NAME || '');

export const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export { BUCKET_NAME };
