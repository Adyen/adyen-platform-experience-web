import { useCallback, useEffect, useState } from 'preact/hooks';
import { FileInputProps } from './types';
import Dropzone from './components/Dropzone';
import UploadedFile from './components/UploadedFile';
import './FileInput.scss';

function FileInput({ onChange, ...restProps }: FileInputProps) {
    const [files, setFiles] = useState<File[]>([]);
    const uploadedFile = files[0];

    const deleteFile = useCallback((fileToDelete: File) => {
        setFiles(currentFiles => {
            const fileIndex = currentFiles.findIndex(file => file === fileToDelete);
            if (fileIndex < 0) return currentFiles;

            const [...currentFilesCopy] = currentFiles;
            currentFilesCopy.splice(fileIndex, 1);
            return currentFilesCopy;
        });
    }, []);

    useEffect(() => void onChange?.([...files]), [files, onChange]);

    return (
        <div className="adyen-pe-file-input">
            {uploadedFile && <UploadedFile file={uploadedFile} deleteFile={() => deleteFile(uploadedFile)} />}
            {files.length === 0 && <Dropzone {...restProps} setFiles={setFiles} />}
        </div>
    );
}

export default FileInput;
