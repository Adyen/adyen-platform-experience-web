export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
            URL.revokeObjectURL(url);
            resolve(dimensions);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not read image dimensions'));
        };
        image.src = url;
    });
};
