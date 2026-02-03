import { v2 as cloudinary } from 'cloudinary';

// SECURITY: Magic Numbers
const SIGNATURES: Record<string, string> = {
    "ffd8ff": "image/jpeg",
    "89504e47": "image/png",
    "25504446": "application/pdf",
    "52494646": "image/webp"
};

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