"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCollegeImage = void 0;
const stream_1 = require("stream");
const busboy_1 = __importDefault(require("busboy"));
const s3Service_1 = require("../utils/s3Service");
const uploadCollegeImage = (req, res) => {
    const httpReq = req;
    try {
        const bb = (0, busboy_1.default)({ headers: httpReq.headers });
        let resolved = false;
        let fileFieldReceived = false;
        const sendError = (status, message) => {
            if (resolved)
                return;
            resolved = true;
            res.status(status).json({ success: false, error: message });
        };
        bb.on('file', (name, file, info) => {
            if (name.toLowerCase() !== 'file') {
                file.resume();
                return;
            }
            fileFieldReceived = true;
            const { filename, mimeType } = info;
            if (!(0, s3Service_1.isAllowedImageType)(mimeType)) {
                file.resume();
                sendError(400, 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
                return;
            }
            const chunks = [];
            let size = 0;
            const maxSize = (0, s3Service_1.getMaxUploadSize)();
            file.on('data', (chunk) => {
                if (resolved)
                    return;
                size += chunk.length;
                if (size > maxSize) {
                    file.destroy();
                    sendError(413, 'File too large. Max size: 5MB.');
                    return;
                }
                chunks.push(chunk);
            });
            file.on('end', () => {
                if (resolved)
                    return;
                if (size > maxSize)
                    return;
                if (size === 0) {
                    sendError(400, 'File is empty.');
                    return;
                }
                const stream = stream_1.Readable.from(Buffer.concat(chunks));
                (0, s3Service_1.uploadToS3)(stream, filename || 'image', mimeType, 'colleges')
                    .then((url) => {
                    if (resolved)
                        return;
                    resolved = true;
                    res.status(200).json({ success: true, data: { url } });
                })
                    .catch(() => {
                    if (!resolved) {
                        resolved = true;
                        res.status(500).json({ success: false, error: 'Upload failed' });
                    }
                });
            });
            file.on('error', () => {
                if (!resolved) {
                    resolved = true;
                    res.status(500).json({ success: false, error: 'Upload failed' });
                }
            });
        });
        bb.on('error', () => {
            sendError(400, 'Invalid multipart body');
        });
        bb.on('finish', () => {
            if (!resolved && !fileFieldReceived) {
                resolved = true;
                res.status(400).json({ success: false, error: 'Missing file. Send form field "file".' });
            }
        });
        httpReq.pipe(bb);
    }
    catch {
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Upload failed' });
        }
    }
};
exports.uploadCollegeImage = uploadCollegeImage;
//# sourceMappingURL=adminUploadController.js.map