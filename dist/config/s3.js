"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Strip BOM and trim (common .env paste/encoding issues)
const raw = (s) => (s || '').replace(/\uFEFF/g, '').trim();
const region = raw(process.env.AWS_REGION || 'us-east-1');
const accessKeyId = raw(process.env.AWS_ACCESS_KEY_ID || '');
// AWS secret is 40 chars; strip quotes, newlines, BOM so .env does not break signature
let secretAccessKey = raw(process.env.AWS_SECRET_ACCESS_KEY || '')
    .replace(/^["']|["']$/g, '')
    .replace(/\r\n|\r|\n/g, '')
    .replace(/[\uFEFF]/g, '')
    .trim();
if (secretAccessKey.length === 41)
    secretAccessKey = secretAccessKey.slice(0, 40);
// Keep only printable ASCII in secret (avoid invisible chars breaking signature)
secretAccessKey = secretAccessKey.replace(/[^\x20-\x7E]/g, '');
const BUCKET_NAME = raw(process.env.AWS_BUCKET_NAME || '');
exports.BUCKET_NAME = BUCKET_NAME;
exports.s3Client = new client_s3_1.S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
//# sourceMappingURL=s3.js.map