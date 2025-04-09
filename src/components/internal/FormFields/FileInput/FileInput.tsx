import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import UploadedFile from './components/UploadedFile';
import Dropzone from './components/Dropzone';
import { BASE_CLASS } from './constants';
import { FileInputProps } from './types';
import './FileInput.scss';

function FileInput({ onChange, ...restProps }: FileInputProps) {
    const [files, setFiles] = useState<File[]>([]);
    const uploadedFiles = useRef(files);
    const uploadedFile = files[0];

    const deleteFile = useCallback((fileToDelete: File) => {
        setFiles(currentFiles => {
            const fileIndex = currentFiles.findIndex(file => file === fileToDelete);

            if (fileIndex < 0) {
                // Negative fileIndex means the file isn't in the array
                // Nothing to delete, return currentFiles (state did not change)
                return currentFiles;
            }

            // Modify and return a clone (instead of the original currentFiles array),
            // so that state is considered to have changed
            const [...currentFilesCopy] = currentFiles;
            currentFilesCopy.splice(fileIndex, 1);
            return currentFilesCopy;
        });
    }, []);

    const uploadFiles = useCallback((files: File[]) => {
        setFiles(currentFiles => {
            if (currentFiles.length === 0 && files.length === 0) {
                // No uploaded files currently, and no files will be uploaded,
                // Nothing to upload, return currentFiles (state did not change)
                return currentFiles;
            } else {
                return files;
            }
        });
    }, []);

    useEffect(() => {
        // Skip calling onChange callback if the uploaded files haven't changed
        if (uploadedFiles.current === files) return;

        // Uploaded files array changed (update the tracking ref)
        uploadedFiles.current = files;

        // Attempt calling onChange callback
        // Pass a clone of the files array (to avoid unexpected mutation)
        onChange?.([...files]);
    }, [files, onChange]);

    return (
        <div className={BASE_CLASS}>
            {
                // prettier-ignore
                uploadedFile
                    ? <UploadedFile file={uploadedFile} deleteFile={() => deleteFile(uploadedFile)} />
                    : <Dropzone {...restProps} uploadFiles={uploadFiles} />
            }
        </div>
    );
}

export default FileInput;
