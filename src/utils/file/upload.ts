/**
 * A unified interface for file (uploaded files) sources, such as:
 * - {@link HTMLInputElement `HTMLInputElement`} — with type of `file`
 * - {@link ClipboardEvent `ClipboardEvent`}`.clipboardData`
 * - {@link DragEvent `DragEvent`}`.dataTransfer`
 * - {@link InputEvent `InputEvent`}`.dataTransfer`
 */
export interface UploadedFileSource {
    files?: FileList | null;
    items?: DataTransferItemList | null;
}

/**
 * Extracts uploaded {@link File files} from the specified file source and returns them in an array.
 * @param uploadedFileSource
 */
export const getUploadedFilesFromSource = <T extends UploadedFileSource>(uploadedFileSource?: T | null): File[] => {
    const uploadedFiles = new Set<File>();

    if (uploadedFileSource?.items) {
        // If there is a `DataTransferItemList` in the source (e.g. for data transfers),
        // try extracting the uploaded files from the `items` list.
        for (const item of uploadedFileSource.items) {
            if (item.kind !== 'file') continue;
            const file = item.getAsFile();
            if (file) uploadedFiles.add(file);
        }
    }

    // If there are no files in the `DataTransferItemList` of the source,
    // or there is no `DataTransferItemList` in the source (e.g. for input elements),
    // try extracting the uploaded files from the `files` list of the source.

    // prettier-ignore
    return Array.from(
        uploadedFiles.size === 0
            ? new Set<File>(uploadedFileSource?.files ?? uploadedFiles)
            : uploadedFiles
    );
};
