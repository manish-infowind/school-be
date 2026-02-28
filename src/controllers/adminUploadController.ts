import { Response } from 'express';
import { Readable } from 'stream';
import busboy from 'busboy';
import { uploadToS3, isAllowedImageType, getMaxUploadSize } from '../utils/s3Service';

export const uploadCollegeImage = (req: unknown, res: Response) => {
    const httpReq = req as import('express').Request & { headers: Record<string, string> };
    try {
        const bb = busboy({ headers: httpReq.headers });
        let resolved = false;
        let fileFieldReceived = false;

        const sendError = (status: number, message: string) => {
            if (resolved) return;
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

            if (!isAllowedImageType(mimeType)) {
                file.resume();
                sendError(400, 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
                return;
            }

            const chunks: Buffer[] = [];
            let size = 0;
            const maxSize = getMaxUploadSize();

            file.on('data', (chunk: Buffer) => {
                if (resolved) return;
                size += chunk.length;
                if (size > maxSize) {
                    file.destroy();
                    sendError(413, 'File too large. Max size: 5MB.');
                    return;
                }
                chunks.push(chunk);
            });

            file.on('end', () => {
                if (resolved) return;
                if (size > maxSize) return;
                if (size === 0) {
                    sendError(400, 'File is empty.');
                    return;
                }
                const stream = Readable.from(Buffer.concat(chunks));
                uploadToS3(stream, filename || 'image', mimeType, 'colleges')
                    .then((url) => {
                        if (resolved) return;
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
    } catch {
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Upload failed' });
        }
    }
};
