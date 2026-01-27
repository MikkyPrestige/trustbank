import { v2 as cloudinary } from 'cloudinary';


// SECURITY: Magic Numbers (File Signatures)
const SIGNATURES: Record<string, string> = {
    "ffd8ff": "image/jpeg",
    "89504e47": "image/png",
    "25504446": "application/pdf",
    "52494646": "image/webp"
};

export async function uploadFileToCloud(file: File, folder: string): Promise<string> {
    if (!file || file.size === 0) throw new Error("File is empty.");
    if (file.size > 10 * 1024 * 1024) throw new Error("File is too large. Max 10MB.");

    //  CONVERT TO BUFFER
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    //  DEEP INSPECTION
    const hex = buffer.subarray(0, 4).toString('hex').toLowerCase();

    let isValid = false;
    for (const sig in SIGNATURES) {
        if (hex.startsWith(sig)) {
            isValid = true;
            break;
        }
    }

    if (!isValid) {
         throw new Error("Security Alert: File content does not match extension. Upload rejected.");
    }

    // 4. UPLOAD WITH SANITIZATION
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `bank_app/${folder}`,
                resource_type: "auto",
                use_filename: false,
                unique_filename: true,
                image_metadata: false
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Error:", error);
                    reject(new Error("Upload failed security check."));
                } else {
                    const format = result?.format;
                    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

                    if (format && !allowed.includes(format)) {
                         reject(new Error("File format validation failed after upload."));
                    } else {
                        resolve(result!.secure_url);
                    }
                }
            }
        ).end(buffer);
    });
}