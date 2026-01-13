'use server';

// In a real app, this would send the file to AWS S3 or Cloudinary.
// For now, we simulate a delay and return a placeholder URL.
export async function mockUpload(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { success: false, url: '' };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return a fake URL based on file type so the UI looks real
    // (In production, replace this with the actual S3 URL)
    return {
        success: true,
        url: `https://avatar.vercel.sh/${Math.random()}`
    };
}