/**
 * Compresses an image file by resizing it and reducing quality.
 * Returns a new Blob/File that is smaller in size.
 */
export async function compressImage(file: File, maxWidth = 800, maxWeightKB = 200): Promise<File | Blob> {
    // If it's already small enough, don't touch it
    if (file.size < maxWeightKB * 1024) return file;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize only if larger than maxWidth
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Canvas context failed"));
                ctx.drawImage(img, 0, 0, width, height);

                // Use JPEG for compression even if original was PNG (unless transparency is needed, but for lab photos JPEG is fine)
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        } else {
                            reject(new Error("Compression failed"));
                        }
                    },
                    'image/jpeg',
                    0.75 // 75% quality
                );
            };
        };
        reader.onerror = (err) => reject(err);
    });
}
