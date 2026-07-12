import { v2 as cloudinary } from 'cloudinary';

// SECURITY: Magic Numbers
const SIGNATURES: Record<string, string> = {
    "ffd8ff": "image/jpeg",
    "89504e47": "image/png",
    "25504446": "application/pdf",
    "52494646": "image/webp"
};

// HEIC/HEIF (default iPhone photo format) has no fixed magic bytes at offset 0 -
// it's an ISO base media file with a variable-length size field, then "ftyp" at
// offset 4 followed by a brand code at offset 8.
const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis', 'hevm', 'hevs'];

function isHeic(buffer: Buffer): boolean {
    if (buffer.length < 12) return false;
    if (buffer.subarray(4, 8).toString('ascii') !== 'ftyp') return false;
    return HEIC_BRANDS.includes(buffer.subarray(8, 12).toString('ascii').toLowerCase());
}

export async function uploadFileToCloud(file: File, folder: string): Promise<string> {
    if (!file || file.size === 0) throw new Error("File is empty.");
    if (file.size > 10 * 1024 * 1024) throw new Error("File is too large.");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check Signature
    const hex = buffer.subarray(0, 4).toString('hex').toLowerCase();
    let isValid = false;
    for (const sig in SIGNATURES) {
        if (hex.startsWith(sig)) isValid = true;
    }
    if (!isValid && isHeic(buffer)) isValid = true;
    if (!isValid) throw new Error("Invalid file type.");

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `bank_app/${folder}`,
                resource_type: "auto",
                use_filename: false,
                unique_filename: true,
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Error:", error);
                    reject(new Error("Upload failed."));
                } else {
                    resolve(result!.secure_url);
                }
            }
        ).end(buffer);
    });
}