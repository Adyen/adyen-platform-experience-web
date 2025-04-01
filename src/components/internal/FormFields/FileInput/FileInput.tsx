import { useCallback, useEffect, useState } from 'preact/hooks';
import { DEFAULT_FILE_TYPES, DEFAULT_MAX_SIZE } from './constants';
import { FileInputProps, FileSource } from './types';
import { getFilesFromSource } from './utils';
import Dropzone from './components/Dropzone';
import UploadedFile from './components/UploadedFile';
import './FileInput.scss';

function FileInput({
    disabled = false,
    required = false,
    maxSize = DEFAULT_MAX_SIZE,
    allowedFileTypes = DEFAULT_FILE_TYPES,
    onChange: propsOnChange,
    ...restProps
}: FileInputProps) {
    const [files, setFiles] = useState<File[]>([]);

    const handleFileDelete = useCallback((fileToDelete: File) => {
        setFiles(currentFiles => {
            const fileIndex = currentFiles.findIndex(file => file === fileToDelete);
            if (fileIndex < 0) return currentFiles;

            const [...currentFilesCopy] = currentFiles;
            currentFilesCopy.splice(fileIndex, 1);
            return currentFilesCopy;
        });
    }, []);

    const updateFiles = useCallback(
        <T extends FileSource>(source?: T | null) => {
            const allowedFiles = getFilesFromSource(source).filter(file => {
                return file.size <= maxSize && allowedFileTypes.includes(file.type);
            });
            setFiles(allowedFiles.slice(0, 1));
        },
        [allowedFileTypes, maxSize]
    );

    const uploadedFile = files[0];

    useEffect(() => {
        propsOnChange?.(files);
    }, [files, propsOnChange]);

    return (
        <div className="adyen-pe-file-input">
            {uploadedFile && <UploadedFile file={uploadedFile} deleteFile={() => handleFileDelete(uploadedFile)} />}
            {files.length === 0 && (
                <Dropzone {...restProps} disabled={disabled} required={required} allowedFileTypes={allowedFileTypes} updateFiles={updateFiles} />
            )}
        </div>
    );
}

export default FileInput;
