"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = void 0;
exports.isAllowedImageType = isAllowedImageType;
exports.getMaxUploadSize = getMaxUploadSize;
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_1 = require("../config/s3");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
function isAllowedImageType(mimeType) {
    return ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase());
}
function getMaxUploadSize() {
    return MAX_FILE_SIZE;
}
const uploadToS3 = async (fileStream, fileName, mimeType, folder = 'avatars') => {
    const region = (process.env.AWS_REGION || 'us-east-1').trim();
    if (!s3_1.BUCKET_NAME) {
        throw new Error('S3 bucket not configured');
    }
    const key = `${folder.replace(/\/$/, '')}/${(0, uuid_1.v4)()}${path_1.default.extname(fileName)}`;
    const upload = new lib_storage_1.Upload({
        client: s3_1.s3Client,
        params: {
            Bucket: s3_1.BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: mimeType,
        },
    });
    await upload.done();
    return `https://${s3_1.BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
};
exports.uploadToS3 = uploadToS3;
//# sourceMappingURL=s3Service.js.map