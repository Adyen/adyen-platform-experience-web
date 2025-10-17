import useCoreContext from '../../../../core/Context/useCoreContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { fixedForwardRef } from '../../../../utils/preact';
import UploadedFile from './components/UploadedFile';
import Dropzone from './components/Dropzone';
import { isFunction } from '../../../../utils';
import { BASE_CLASS, validationErrors } from './constants';
import { FileInputProps, ValidationError } from './types';
import './FileInput.scss';

export const FileInput = fixedForwardRef<FileInputProps, HTMLInputElement>(({ onChange, mapError, onDelete, ...restProps }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const uploadedFiles = useRef(files);
    const uploadedFile = files[0];
    const { i18n } = useCoreContext();
    const { disabled } = restProps;

    const defaultMapError = useCallback(
        (error: ValidationError): string => {
            switch (error) {
                case validationErrors.DISALLOWED_FILE_TYPE:
                    return i18n.get('common.inputs.file.errors.disallowedType');
                case validationErrors.FILE_REQUIRED:
                    return i18n.get('common.inputs.file.errors.required');
                case validationErrors.TOO_MANY_FILES:
                    return i18n.get('common.inputs.file.errors.tooMany');
                case validationErrors.VERY_LARGE_FILE:
                    return i18n.get('common.inputs.file.errors.tooLarge');
            }
        },
        [i18n]
    );

    const mapErrorWithFallback = useMemo(() => (isFunction(mapError) ? mapError : defaultMapError), [mapError]);

    const deleteFile = useCallback(
        (fileToDelete: File) => {
            if (disabled) return;
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

            onDelete?.();
        },
        [disabled, onDelete]
    );

    const uploadFiles = useCallback(
        (files: File[]) => {
            if (disabled) return;
            setFiles(currentFiles => {
                if (currentFiles.length === 0 && files.length === 0) {
                    // No uploaded files currently, and no files will be uploaded,
                    // Nothing to upload, return currentFiles (state did not change)
                    return currentFiles;
                } else {
                    return files;
                }
            });
        },
        [disabled]
    );

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
                    ? <UploadedFile disabled={disabled} file={uploadedFile} deleteFile={() => deleteFile(uploadedFile)} />
                    : <Dropzone {...restProps} ref={ref} mapError={mapErrorWithFallback} uploadFiles={uploadFiles} />
            }
        </div>
    );
});

export default FileInput;
