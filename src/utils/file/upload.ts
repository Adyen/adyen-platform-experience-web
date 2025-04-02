export interface UploadedFileSource {
    files: DataTransfer['files'] | null;
    items?: DataTransfer['items'];
}

export const getUploadedFilesFromSource = <T extends UploadedFileSource>(uploadedFileSource?: T | null): File[] => {
    const uploadedFiles: File[] = [];

    if (uploadedFileSource?.items) {
        for (const item of uploadedFileSource.items) {
            if (item.kind !== 'file') continue;
            const file = item.getAsFile();
            if (file) uploadedFiles.push(file);
        }
    }

    return uploadedFiles.length === 0 ? Array.from(uploadedFileSource?.files ?? uploadedFiles) : uploadedFiles;
};
